const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI 설정 (환경변수에서 API 키를 가져옴)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 업로드된 파일을 저장할 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads');
const chartsDir = path.join(__dirname, 'generated-charts');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true });
}

// Multer 설정 - 모든 파일 형식 허용
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 모든 파일 형식 허용
    cb(null, true);
  }
});

// 파일 업로드 및 AI 분석 엔드포인트
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    // 파일 정보를 OpenAI에 전송하여 분석
    const fileContent = await analyzeFile(filePath, fileName);
    
    res.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      file: {
        name: fileName,
        size: fileSize,
        path: filePath,
        content: fileContent
      }
    });

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

// 파일 분석 함수
async function analyzeFile(filePath, fileName) {
  try {
    // 파일 확장자에 따라 다른 처리 방식 적용
    const ext = path.extname(fileName).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
      // 이미지 파일인 경우
      return await analyzeImage(filePath);
    } else if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      // 엑셀/CSV 파일인 경우
      return await analyzeExcel(filePath);
    } else if (ext === '.pdf') {
      // PDF 파일인 경우
      return await analyzePDF(filePath);
    } else {
      // 기타 파일 형식
      return await analyzeGenericFile(filePath);
    }
  } catch (error) {
    console.error('파일 분석 오류:', error);
    throw error;
  }
}

// 이미지 파일 분석
async function analyzeImage(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "이 이미지에서 데이터를 추출하고 차트로 표현할 수 있는 정보를 분석해주세요. 데이터의 구조, 값, 패턴 등을 자세히 설명해주세요."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('이미지 분석 오류:', error);
    return '이미지 분석 중 오류가 발생했습니다.';
  }
}

// 엑셀/CSV 파일 분석
async function analyzeExcel(filePath) {
  try {
    // 실제 구현에서는 엑셀 파일을 읽어서 텍스트로 변환
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `다음 파일 내용을 분석하여 차트로 표현할 수 있는 데이터 구조와 패턴을 설명해주세요:\n\n${fileContent.substring(0, 2000)}`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('엑셀 파일 분석 오류:', error);
    return '엑셀 파일 분석 중 오류가 발생했습니다.';
  }
}

// PDF 파일 분석
async function analyzePDF(filePath) {
  try {
    // 실제 구현에서는 PDF를 텍스트로 변환
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `다음 PDF 내용을 분석하여 차트로 표현할 수 있는 데이터 구조와 패턴을 설명해주세요:\n\n${fileContent.substring(0, 2000)}`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('PDF 파일 분석 오류:', error);
    return 'PDF 파일 분석 중 오류가 발생했습니다.';
  }
}

// 일반 파일 분석
async function analyzeGenericFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `다음 파일 내용을 분석하여 차트로 표현할 수 있는 데이터 구조와 패턴을 설명해주세요:\n\n${fileContent.substring(0, 2000)}`
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('파일 분석 오류:', error);
    return '파일 분석 중 오류가 발생했습니다.';
  }
}

// 차트 생성 엔드포인트
app.post('/generate-chart', async (req, res) => {
  try {
    const { chartType, style, dataAnalysis, feedback } = req.body;
    
    // OpenAI를 사용하여 차트 데이터와 스타일 생성
    const chartData = await generateChartData(chartType, style, dataAnalysis, feedback);
    
    // IBChart 스타일에 맞는 HTML 생성
    const chartHtml = generateIBChartHTML(chartType, style, chartData);
    
    // 차트 HTML을 파일로 저장
    const chartFileName = `chart-${Date.now()}.html`;
    const chartFilePath = path.join(chartsDir, chartFileName);
    fs.writeFileSync(chartFilePath, chartHtml);
    
    res.json({
      success: true,
      chartUrl: `/charts/${chartFileName}`,
      chartData: chartData
    });

  } catch (error) {
    console.error('차트 생성 오류:', error);
    res.status(500).json({ error: '차트 생성 중 오류가 발생했습니다.' });
  }
});

// 차트 데이터 생성 함수
async function generateChartData(chartType, style, dataAnalysis, feedback) {
  try {
    const prompt = `
차트 타입: ${chartType}
스타일: ${style}
데이터 분석: ${dataAnalysis}
피드백: ${feedback || '없음'}

위 정보를 바탕으로 차트에 사용할 샘플 데이터를 생성해주세요. 
데이터는 JSON 형식으로 제공하고, 차트의 제목, 축 레이블, 데이터 포인트 등을 포함해주세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    
    // JSON 데이터 추출 시도
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('JSON 파싱 실패, 텍스트 반환');
    }
    
    return {
      title: `${chartType} 차트`,
      data: content,
      style: style
    };
  } catch (error) {
    console.error('차트 데이터 생성 오류:', error);
    return {
      title: `${chartType} 차트`,
      data: '데이터 생성 중 오류가 발생했습니다.',
      style: style
    };
  }
}

// IBChart HTML 생성 함수
function generateIBChartHTML(chartType, style, chartData) {
  const isMonochrome = style === 'mono';
  
  let chartConfig = '';
  let chartDataStr = '';
  
  // 차트 타입에 따른 설정
  switch (chartType) {
    case 'bar':
      chartConfig = `
        series: [{
          type: 'bar',
          data: ${JSON.stringify(chartData.data || [])}
        }],
        xAxis: {
          type: 'category',
          data: ${JSON.stringify(chartData.categories || ['A', 'B', 'C', 'D', 'E'])}
        },
        yAxis: {
          type: 'value'
        }`;
      break;
    case 'line':
      chartConfig = `
        series: [{
          type: 'line',
          data: ${JSON.stringify(chartData.data || [])}
        }],
        xAxis: {
          type: 'category',
          data: ${JSON.stringify(chartData.categories || ['A', 'B', 'C', 'D', 'E'])}
        },
        yAxis: {
          type: 'value'
        }`;
      break;
    case 'pie':
      chartConfig = `
        series: [{
          type: 'pie',
          radius: '50%',
          data: ${JSON.stringify(chartData.data || [])}
        }]`;
      break;
    case 'area':
      chartConfig = `
        series: [{
          type: 'line',
          areaStyle: {},
          data: ${JSON.stringify(chartData.data || [])}
        }],
        xAxis: {
          type: 'category',
          data: ${JSON.stringify(chartData.categories || ['A', 'B', 'C', 'D', 'E'])}
        },
        yAxis: {
          type: 'value'
        }`;
      break;
    default:
      chartConfig = `
        series: [{
          type: 'bar',
          data: ${JSON.stringify(chartData.data || [])}
        }],
        xAxis: {
          type: 'category',
          data: ${JSON.stringify(chartData.categories || ['A', 'B', 'C', 'D', 'E'])}
        },
        yAxis: {
          type: 'value'
        }`;
  }

  // 모노크롬 스타일 적용
  const colorScheme = isMonochrome ? 
    ['#666666', '#888888', '#aaaaaa', '#cccccc', '#eeeeee'] : 
    ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chartData.title || 'AI 생성 차트'}</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .chart-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart-title {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        #chart {
            width: 100%;
            height: 500px;
            margin: 20px 0;
        }
        .download-btn {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 6px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .download-btn:hover {
            background-color: #0056b3;
        }
        .chart-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h1 class="chart-title">${chartData.title || 'AI 생성 차트'}</h1>
        
        <div class="chart-info">
            <strong>차트 타입:</strong> ${chartType}<br>
            <strong>스타일:</strong> ${style}<br>
            <strong>생성 시간:</strong> ${new Date().toLocaleString('ko-KR')}
        </div>
        
        <div id="chart"></div>
        
        <button class="download-btn" onclick="downloadChart()">차트 이미지 다운로드</button>
    </div>

    <script>
        // 차트 초기화
        var chartDom = document.getElementById('chart');
        var myChart = echarts.init(chartDom);
        
        // 차트 옵션
        var option = {
            title: {
                text: '${chartData.title || 'AI 생성 차트'}',
                left: 'center',
                textStyle: {
                    color: '#333',
                    fontSize: 18
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            color: ${JSON.stringify(colorScheme)},
            ${chartConfig}
        };
        
        // 차트 렌더링
        myChart.setOption(option);
        
        // 반응형 처리
        window.addEventListener('resize', function() {
            myChart.resize();
        });
        
        // 차트 다운로드 함수
        function downloadChart() {
            const url = myChart.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#fff'
            });
            
            const link = document.createElement('a');
            link.download = 'chart-${Date.now()}.png';
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>`;
}

// 생성된 차트 파일 제공
app.use('/charts', express.static(chartsDir));

// 메인 페이지 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키를 설정하려면 환경변수 OPENAI_API_KEY를 설정하세요.');
});
