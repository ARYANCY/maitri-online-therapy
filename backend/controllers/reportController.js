const Metrics = require("../models/metrics");
const Screening = require("../models/Screening");
const Todo = require("../models/todo");
const User = require("../models/User");
const logger = require("../utils/logger");
const { asyncHandler } = require("../middleware/errorHandler");
const PDFDocument = require('pdfkit');

function calculateStatistics(metricsData, screeningData, todos) {
  const totalEntries = metricsData.length;
  if (!totalEntries) return {
    summary: { totalEntries:0, averageStress:0, averageHappiness:0, averageAnxiety:0, averageMood:0, averagePHQ9:0, averageGAD7:0, averageGHQ:0, riskLevel:'low' },
    trends: { stressTrend:'stable', happinessTrend:'stable', anxietyTrend:'stable', moodTrend:'stable' }
  };

  const avgStress = metricsData.reduce((sum,m)=>sum+(m.stress_level||0),0)/totalEntries;
  const avgHappiness = metricsData.reduce((sum,m)=>sum+(m.happiness_level||0),0)/totalEntries;
  const avgAnxiety = metricsData.reduce((sum,m)=>sum+(m.anxiety_level||0),0)/totalEntries;
  const avgMood = metricsData.reduce((sum,m)=>sum+(m.overall_mood_level||0),0)/totalEntries;
  const avgPHQ9 = screeningData.reduce((sum,s)=>sum+(s.phq9_score||0),0)/Math.max(screeningData.length,1);
  const avgGAD7 = screeningData.reduce((sum,s)=>sum+(s.gad7_score||0),0)/Math.max(screeningData.length,1);
  const avgGHQ = screeningData.reduce((sum,s)=>sum+(s.ghq_score||0),0)/Math.max(screeningData.length,1);

  let riskLevel='low';
  if(avgPHQ9>15||avgGAD7>10||avgGHQ>20) riskLevel='high';
  else if(avgPHQ9>10||avgGAD7>7||avgGHQ>15) riskLevel='moderate';

  const mid=Math.floor(totalEntries/2);
  const firstHalf=metricsData.slice(0,mid);
  const secondHalf=metricsData.slice(mid);

  const calculateTrend=(first,second,field)=>{
    if(!first.length||!second.length) return 'stable';
    const firstAvg=first.reduce((sum,m)=>sum+(m[field]||0),0)/first.length;
    const secondAvg=second.reduce((sum,m)=>sum+(m[field]||0),0)/second.length;
    const diff=secondAvg-firstAvg;
    if(Math.abs(diff)<2) return 'stable';
    return diff>0?'improving':'declining';
  };

  return {
    summary: {
      totalEntries,
      averageStress: Math.round(avgStress*100)/100,
      averageHappiness: Math.round(avgHappiness*100)/100,
      averageAnxiety: Math.round(avgAnxiety*100)/100,
      averageMood: Math.round(avgMood*100)/100,
      averagePHQ9: Math.round(avgPHQ9*100)/100,
      averageGAD7: Math.round(avgGAD7*100)/100,
      averageGHQ: Math.round(avgGHQ*100)/100,
      riskLevel
    },
    trends: {
      stressTrend: calculateTrend(firstHalf,secondHalf,'stress_level'),
      happinessTrend: calculateTrend(firstHalf,secondHalf,'happiness_level'),
      anxietyTrend: calculateTrend(firstHalf,secondHalf,'anxiety_level'),
      moodTrend: calculateTrend(firstHalf,secondHalf,'overall_mood_level')
    }
  };
}

function generateRecommendations(stats, language) {
  const recs=[];
  if(stats.summary.averageStress>30) recs.push({
    category:'stress',
    priority:'high',
    message: language==='hi'?'तनाव का स्तर उच्च है। ध्यान और व्यायाम की सलाह दी जाती है।':
            language==='as'?'মানসিক চাপৰ স্তৰ উচ্চ। ধ্যান আৰু ব্যায়ামৰ পৰামৰ্শ দিয়া হয়।':
            'Stress levels are high. Consider meditation and exercise.'
  });
  if(stats.summary.averageHappiness<20) recs.push({
    category:'happiness',
    priority:'high',
    message: language==='hi'?'खुशी का स्तर कम है। सामाजिक गतिविधियों में भाग लेने की सलाह दी जाती है।':
            language==='as'?'সুখৰ স্তৰ কম। সামাজিক কাৰ্যকলাপত অংশগ্ৰহণৰ পৰামৰ্শ দিয়া হয়।':
            'Happiness levels are low. Consider engaging in social activities.'
  });
  if(stats.summary.riskLevel==='high') recs.push({
    category:'professional',
    priority:'urgent',
    message: language==='hi'?'पेशेवर मदद की सिफारिश की जाती है। कृपया एक योग्य काउंसलर से संपर्क करें।':
            language==='as'?'পেছাদাৰী সহায়ৰ পৰামৰ্শ দিয়া হয়। অনুগ্ৰহ কৰি এজন যোগ্য কাউন্সেলৰৰ সৈতে যোগাযোগ কৰক।':
            'Professional help is recommended. Please contact a qualified counselor.'
  });
  return recs;
}

function generateChartData(metricsData, screeningData) {
  return {
    labels: metricsData.map(m=>new Date(m.createdAt).toISOString().split('T')[0]),
    datasets:[
      { label:'Stress Level', data:metricsData.map(m=>m.stress_level||0), borderColor:'#ff6b6b', backgroundColor:'rgba(255, 107, 107, 0.1)' },
      { label:'Happiness Level', data:metricsData.map(m=>m.happiness_level||0), borderColor:'#4ecdc4', backgroundColor:'rgba(78, 205, 196, 0.1)' },
      { label:'Anxiety Level', data:metricsData.map(m=>m.anxiety_level||0), borderColor:'#ffe66d', backgroundColor:'rgba(255, 230, 109, 0.1)' },
      { label:'Overall Mood', data:metricsData.map(m=>m.overall_mood_level||0), borderColor:'#a8e6cf', backgroundColor:'rgba(168, 230, 207, 0.1)' }
    ]
  };
}

function convertToCSV(reportData) {
  if(!reportData||!reportData.summary) return '';
  const headers=['Date','Stress Level','Happiness Level','Anxiety Level','Overall Mood','PHQ-9 Score','GAD-7 Score','GHQ Score','Risk Level'];
  const rows=[headers.join(',')];
  const metricsData=reportData.metricsData||[];
  const screeningData=reportData.screeningData||[];
  const dataByDate={};

  metricsData.forEach(m=>{
    const date=new Date(m.createdAt).toISOString().split('T')[0];
    dataByDate[date]={ stress:m.stress_level||0, happiness:m.happiness_level||0, anxiety:m.anxiety_level||0, mood:m.overall_mood_level||0 };
  });

  screeningData.forEach(s=>{
    const date=new Date(s.createdAt).toISOString().split('T')[0];
    dataByDate[date]={ ...dataByDate[date], phq9:s.phq9_score||0, gad7:s.gad7_score||0, ghq:s.ghq_score||0 };
  });

  Object.keys(dataByDate).sort().forEach(date=>{
    const d=dataByDate[date];
    rows.push([date,d.stress??0,d.happiness??0,d.anxiety??0,d.mood??0,d.phq9??0,d.gad7??0,d.ghq??0,reportData.summary.riskLevel||'low'].join(','));
  });

  return rows.join('\n');
}

function sendPDF(reportData,res) {
  const doc=new PDFDocument({ margin:30 });
  const buffers=[];
  doc.on('data',buffers.push.bind(buffers));
  doc.on('end',()=>{
    const pdfData=Buffer.concat(buffers);
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename="maitri-report-${Date.now()}.pdf"`);
    res.send(pdfData);
  });
  doc.fontSize(20).text('Maitri Mental Health Report',{ align:'center' });
  doc.moveDown();
  doc.fontSize(14).text(`User: ${reportData.user.name} (${reportData.user.email})`);
  doc.text(`Member Since: ${new Date(reportData.user.memberSince).toDateString()}`);
  doc.text(`Generated On: ${new Date(reportData.generatedAt).toDateString()}`);
  doc.moveDown();
  doc.fontSize(16).text('Summary');
  Object.entries(reportData.summary).forEach(([k,v])=>doc.fontSize(12).text(`${k}: ${v}`));
  doc.moveDown();
  if(reportData.recommendations.length){
    doc.fontSize(16).text('Recommendations');
    reportData.recommendations.forEach(r=>doc.fontSize(12).text(`- [${r.priority}] ${r.message}`));
  }
  doc.end();
}

exports.downloadReport=asyncHandler(async(req,res)=>{
  const userId=req.user?._id||req.session?.userId;
  if(!userId) return res.status(401).json({ success:false, error:req.t("auth.unauthorized") });
  const userLanguage=req.getLanguage();
  const { format='json' }=req.query;

  logger.info('Report download requested',{ userId, format, language:userLanguage, ip:req.ip, requestId:req.id });

  try{
    const reportData=await generateReportData(userId,userLanguage,req);
    if(format==='json'){
      res.setHeader('Content-Type','application/json');
      res.setHeader('Content-Disposition',`attachment; filename="maitri-report-${Date.now()}.json"`);
      res.json(reportData);
    } else if(format==='csv'){
      const csvData=convertToCSV(reportData);
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition',`attachment; filename="maitri-report-${Date.now()}.csv"`);
      res.send(csvData);
    } else if(format==='pdf'){
      sendPDF(reportData,res);
    } else {
      res.status(400).json({ success:false, error:req.t("general.badRequest") });
    }
    logger.info('Report downloaded successfully',{ userId, format, language:userLanguage, requestId:req.id });
  } catch(err){
    logger.error('Report download failed',{ userId, error:err.message, format, language:userLanguage, ip:req.ip, requestId:req.id });
    res.status(500).json({ success:false, error:req.t("report.error") });
  }
});

module.exports={ generateReportData, sendPDF, convertToCSV, generateRecommendations, calculateStatistics, generateChartData };
