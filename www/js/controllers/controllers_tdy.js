angular.module('tdy.controllers', ['ionic','kidney.services','ionic-datepicker'])

/////////////////////////tongdanyang/////////////////
.controller('DoctorDiagnoseCtrl', ['$scope', 'Storage','ionicDatePicker','Patient','$state', function ($scope, Storage,ionicDatePicker,Patient,$state) {
  $scope.Hypers =
  [
    {Name:"是",Type:1},
    {Name:"否",Type:2}
  ]
  
  $scope.Diseases =
  [
    {Name:"CKD1-2期",Type:2},
    {Name:"CKD3-4期",Type:3},
    {Name:"CDK5期未透析",Type:4},
    {Name:"腹透",Type:5},
    {Name:"血透",Type:6},
    {Name:"肾移植",Type:1}
  ]
  $scope.progressSelect =
  [
    [
      "疾病活跃期",
      "稳定期",
      ">3年"
    ],
    [
      "疾病活跃期",
      "稳定期"
    ]
  ]
  $scope.showDateTitle=function(type)
  {
    // console.log(type)
    var title="";
    if(type==1)
      title="手术日期"
    else if(type==5)
      title="插管日期"
    else if(type==6)
      title="开始日期"
    return title
  }
  var latestDiagnose=angular.fromJson(Storage.get("latestDiagnose"))
  console.log(latestDiagnose)
  $scope.Diagnose = 
  {
    "diagname": latestDiagnose.name,
    "diagtime": latestDiagnose.time,
    "operationTime": latestDiagnose.operationTime,
    "hypertension": latestDiagnose.hypertension,
    "diagprogress": latestDiagnose.progress,
    "diagcontent":latestDiagnose.content
  }
  var datepickerD = {
        callback: function (val) {  //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.Diagnose.operationTime=new Date(val);
        },
        titleLabel: '手术日期',
        inputDate: new Date(),
        mondayFirst: true,
        closeOnSelect: false,
        templateType: 'popup',
        setLabel: '确定',
        todayLabel: '今天',
        closeLabel: '取消',
        showTodayButton: true,
        dateFormat: 'yyyy MMMM dd',
        weeksList: ["周日","周一","周二","周三","周四","周五","周六"],
        monthsList:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
    };
    $scope.openDatePicker = function(){
        ionicDatePicker.openDatePicker(datepickerD);
    };

  // {
  //     patientId:'',
  //     doctorId:'',
  //     diagname:'',
  //     diagtime:'',
  //     diagprogress:'',
  //     diagcontent:''
  //   }
  $scope.saveDiagnose=function()
  {
    $scope.Diagnose.patientId=Storage.get('getpatientId');
    $scope.Diagnose.doctorId=Storage.get('UID');
    console.log($scope.Diagnose)
    Patient.insertDiagnosis($scope.Diagnose)
    .then(function(data){
      console.log(data)
      $state.go('tab.patientDetail');
    },function(err)
    {
      console.log(err)
    })
  }

  $scope.reset =function(){
    $scope.Diagnose = 
    {
      "KidneyDisease": null,
      "DiseaseDetail": null,
      "OperationDate": null,
      "Hypertension": '稳定期',
      "DetailDiagnose": null
    }
  }
}])
.controller('TestRecordCtrl', ['$scope', '$http','Storage','VitalSign', function ($scope,$http, Storage,VitalSign) {
  


      VitalSign.getVitalSigns({userId:'U201702071766',type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].date>="2017-04-08"&&Data.results[i].code=="舒张压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        AmCharts.makeChart("chartdiv", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"舒张压","mmHg");
      }, function(e) {  
      });

      VitalSign.getVitalSigns({userId:'U201702071766',type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="收缩压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        AmCharts.makeChart("chartdiv1", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"收缩压","mmHg");
      }, function(e) {  
      });

      VitalSign.getVitalSigns({userId:'U201702071766',type:'体温'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体温"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv2", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {  
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'体重'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体重"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv3", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {  
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'尿量'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="尿量"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv4", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {  
      });
VitalSign.getVitalSigns({userId:'U201702071766',type:'心率'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results[0])
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="心率"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }

        AmCharts.makeChart("chartdiv5", {
          "type": "serial",
          "theme": "light",
          "marginTop":0,
          "marginRight": 80,
          "dataProvider": $scope.ChartData,
          "valueAxes": [{
              "axisAlpha": 0,
              "position": "left"
          }],
          "graphs": [{
              "id":"g1",
              "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
              "bullet": "round",
              "bulletSize": 8,
              "lineColor": "#d1655d",
              "lineThickness": 2,
              "negativeLineColor": "#637bb6",
              // "type": "smoothedLine",
              "valueField": "value"
          }],
          "chartScrollbar": {
              "graph":"g1",
              "gridAlpha":0,
              "color":"#888888",
              "scrollbarHeight":55,
              "backgroundAlpha":0,
              "selectedBackgroundAlpha":0.1,
              "selectedBackgroundColor":"#888888",
              "graphFillAlpha":0,
              "autoGridCount":true,
              "selectedGraphFillAlpha":0,
              "graphLineAlpha":0.2,
              "graphLineColor":"#c2c2c2",
              "selectedGraphLineColor":"#888888",
              "selectedGraphLineAlpha":1

          },
          "chartCursor": {
              "categoryBalloonDateFormat": "YYYY-MM-DD",
              "cursorAlpha": 0,
              "valueLineEnabled":true,
              "valueLineBalloonEnabled":true,
              "valueLineAlpha":0.5,
              "fullWidth":true
          },
          "dataDateFormat": "YYYY-MM-DD",
          "categoryField": "time",
          "categoryAxis": {
              "minPeriod": "mm",
              "parseDates": true,
              "minorGridAlpha": 0.1,
              "minorGridEnabled": true
          },
          "export": {
              "enabled": true
          }
      });

      }, function(e) {  
      });
  // $scope.$on('$ionicView.afterEnter', function() {  

//                 console.log('afterEnter');  

// }, false);  
 // console.log("mmb");
 //  $scope.$on('$ionicView.enter', function() 
 //  {
 //    console.log("mmb");
     // $http.get("../data/pressure.json").success(function(data) {
     //     $scope.pressuredata = data;
     //     console.log($scope.pressuredata)
     //     createStockChart($scope.pressuredata,"血压","mmHg");
     // });
  // })

  // $scope.title="血压"
  // $scope.unit="mmHg"
  // $scope.chart = createStockChart($scope.data1,$scope.title,$scope.unit);
  ////提振参数选择下拉框选项 默认收缩压selected
  //下拉选择不同体征类型
  // $scope.options = [{"SignName":"血压"},
  //   {"SignName":"体重"},
  //   {"SignName":"体温"},
  //   {"SignName":"尿量"},
  //   {"SignName":"心率"}
  // ];  
  // $scope.vitalInfo=$scope.options[0].SignName

  // //切换体征
  // $scope.changeVitalInfo = function(option) 
  //   {
  //      $scope.selectedname=option;
  //      console.log($scope.selectedname)
  //      drawcharts($scope.selectedname);
  //   };
  //   //根据体征类型画图
  //   var drawcharts=function(param){
  //   if (param=="血压") {
  //     VitalSign.getVitalSigns({userId:'zxftest001',type:'type1'}).then(
  //     function(Data){
  //       $scope.ChartData=[];
  //       console.log(Data.results[0])
  //       console.log(Data.results.length)
  //       for(var i=0;i<Data.results.length;i++){
  //         if(Data.results[i].date>="2017-04-07"){
  //           for(var j=0;j<Data.results[i].data.length;j++){
  //             $scope.ChartData.push(Data.results[i].data[j])
  //           }
  //         }
  //       }

  //       console.log($scope.ChartData);
  //       createStockChart($scope.ChartData,"舒张压","mmHg");
  //     }, function(e) {  
  //     });
      
      
  //   }
  //   if(param=="体温"){
  //     VitalSign.getVitalSigns({userId:'zxftest001',type:'type2'}).then(
  //     function(Data){
  //       $scope.ChartData=[];
  //       console.log(Data.results[0])
  //       console.log(Data.results.length)
  //       for(var i=0;i<Data.results.length;i++){
  //         if(Data.results[i].date>="2017-04-07"){
  //           for(var j=0;j<Data.results[i].data.length;j++){
  //             $scope.ChartData.push(Data.results[i].data[j])
  //           }
  //         }
  //       }

  //       console.log($scope.ChartData);
  //       createStockChart($scope.ChartData,"舒张压","mmHg");
  //     }, function(e) {  
  //     });
      
  //   }
  // }
  //传参绘图
  function createStockChart(chartname,ChartData,title,unit) {

    chart="";
    var chart = AmCharts.makeChart("chartname", {
    "type": "serial",
    "theme": "light",
    "marginTop":0,
    "marginRight": 80,
    "dataProvider": ChartData,
    "valueAxes": [{
        "axisAlpha": 0,
        "position": "left"
    }],
    "graphs": [{
        "id":"g1",
        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
        "bullet": "round",
        "bulletSize": 8,
        "lineColor": "#d1655d",
        "lineThickness": 2,
        "negativeLineColor": "#637bb6",
        "type": "smoothedLine",
        "valueField": "value"
    }],
    "chartScrollbar": {
        "graph":"g1",
        "gridAlpha":0,
        "color":"#888888",
        "scrollbarHeight":55,
        "backgroundAlpha":0,
        "selectedBackgroundAlpha":0.1,
        "selectedBackgroundColor":"#888888",
        "graphFillAlpha":0,
        "autoGridCount":true,
        "selectedGraphFillAlpha":0,
        "graphLineAlpha":0.2,
        "graphLineColor":"#c2c2c2",
        "selectedGraphLineColor":"#888888",
        "selectedGraphLineAlpha":1

    },
    "chartCursor": {
        "categoryBalloonDateFormat": "YYYY-MM-DD",
        "cursorAlpha": 0,
        "valueLineEnabled":true,
        "valueLineBalloonEnabled":true,
        "valueLineAlpha":0.5,
        "fullWidth":true
    },
    "dataDateFormat": "YYYY-MM-DD",
    "categoryField": "time",
    "categoryAxis": {
        "minPeriod": "mm",
        "parseDates": true,
        "minorGridAlpha": 0.1,
        "minorGridEnabled": true
    },
    "export": {
        "enabled": true
    }
});


  // chart.addListener("rendered", zoomChart);
  // if(chart.zoomChart){
  //   chart.zoomChart();
  // }

  // function zoomChart(){
  //     chart.zoomToIndexes(Math.round(chart.dataProvider.length * 0.4), Math.round(chart.dataProvider.length * 0.55));
  // }
  }
  
}])

//任务设置--GL
.controller('TaskSetCtrl', ['$scope', '$state', '$ionicPopup', 'Storage', function ($scope, $state, $ionicPopup, Storage) {
   var UserId = Storage.get('UID'); 
    $scope.$on('$ionicView.enter', function() {
        Temp();
    }); 
  //任务先写死
    $scope.Tasks = [
        {
          "type": "Measure",
          "details": [
            {
              "code": "Temperature",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "Weight",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "BloodPressure",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 2,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "Vol",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            },
            {
              "code": "HeartRate",
              "instruction": "",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 2,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "天"
            }
          ]
        },
        {
          "type": "ReturnVisit",
          "details": [            
            {
              "code": "TimeInterval_3",
              "instruction": "术后时间>3年",
              "content": "",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 2,
              "frequencyUnits": "月"
            }
          ]
        },
        {
          "type": "LabTest",
          "details": [
            {
              "code": "LabTest_3",
              "instruction": "术后时间>3年",
              "content": "血常规、血生化、尿常规、尿生化、移植肾彩超、血药浓度",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 2,
              "frequencyUnits": "周"
            }
          ]
        },
        {
          "type": "SpecialEvaluate",
          "details": [
            {
              "code": "ECG",
              "instruction": "",
              "content": "心电图，胸片，移植肾B超",
              "startTime": "2050-11-02T07:58:51.718Z",
              "endTime": "2050-11-02T07:58:51.718Z",
              "times": 1,
              "timesUnits": "次",
              "frequencyTimes": 1,
              "frequencyUnits": "年"
            }            
          ]
        }
      ];
  
  function Temp()
    {
       //console.log($scope.Tasks);
       $scope.Tasks.Other = [];
      for (var i=0;i<$scope.Tasks.length;i++)
      {      
         var task = $scope.Tasks[i];
         if(task.type == 'Measure')
         {
            $scope.Tasks.Measure = task.details;
            for(var j=0;j<$scope.Tasks.Measure.length;j++)
            {
                $scope.Tasks.Measure[j].Name = NameMatch($scope.Tasks.Measure[j].code);                    
            }
         }
         else
         {
            var newTask = task.details[0];        
            newTask.type = task.type;
            newTask.Name = NameMatch(newTask.type);               
            $scope.Tasks.Other.push(newTask);                            
         }
         
      }
      //console.log($scope.Tasks);
    }

  //名称转换
   function NameMatch(name)
   {
     var Tbl = [
                 {Name:'体温', Code:'Temperature'},
                 {Name:'体重', Code:'Weight'},
                 {Name:'血压', Code:'BloodPressure'},
                 {Name:'尿量', Code:'Vol'},
                 {Name:'心率', Code:'HeartRate'},
                 {Name:'复诊', Code:'ReturnVisit'},
                 {Name:'化验', Code:'LabTest'},
                 {Name:'特殊评估', Code:'SpecialEvaluate'}
                ];
      for (var i=0;i<Tbl.length;i++)
      {
         if(Tbl[i].Code == name)
         {
            name = Tbl[i].Name
            break;
         }
      }
      return name;
   }
  
  //下拉框数据
    $scope.Units = ["天", "周", "年", "月"];
    $scope.Times = [1, 2, 3, 4, 5, 6];

  //确定按钮
    $scope.OkClick = function()
    {
        //调用修改模板函数
        $state.go('tab.patientDetail');
    }
  
  //编辑任务描述
    $scope.showPopup = function(task) {
      $scope.data = {};    
      $scope.data.value = task.content;                    
      var myPopup = $ionicPopup.show({
         template: '<textarea style="height:150px;" ng-model="data.value"></textarea>',     
         title: '请填写'+ task.Name + '备注',
         scope: $scope,
         buttons: [
           { text: '取消' },
           {
             text: '<b>保存</b>',
             type: 'button-positive',
             onTap: function(e) {
               if (!$scope.data.value) {
                 // 不允许用户关闭，除非输入内容
                 e.preventDefault();
               } else {
                return $scope.data.value;
               }  
            }
           },
           ]
       });
       myPopup.then(function(res) {
        //console.log(res);
        if(res)
        {        
          for(var i=0;i<$scope.Tasks.Measure.length;i++)
          {
              if($scope.Tasks.Measure[i].Name == task.Name)
              {
                  $scope.Tasks.Measure[i].content = res;
                  break;
              }
          } 
          for(var i=0;i<$scope.Tasks.Other.length;i++)
          {
              if($scope.Tasks.Other[i].Name == task.Name)
              {
                  $scope.Tasks.Other[i].content = res;
                  break;
              }
          } 
        } 
        //console.log( $scope.Tasks);
      });
    };

}])

//健康信息--PXY
.controller('HealthInfoCtrl', ['$scope','$timeout','$state','$ionicHistory','$ionicPopup','Storage','Health','Dict',function($scope, $timeout,$state,$ionicHistory,$ionicPopup,Storage,Health,Dict) {
  $scope.barwidth="width:0%";
  //var patientId = Storage.get('UID')
  var patientId = 'p01'

  $scope.Goback = function(){
    $state.go('tab.patientDetail')
  }

  //从字典中搜索选中的对象。
  // var searchObj = function(code,array){
  //     for (var i = 0; i < array.length; i++) {
  //       if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
  //     };
  //     return "未填写";
  // }
  //console.log(HealthInfo.getall());

  $scope.items = []//HealthInfo.getall();
  

  Health.getAllHealths({userId:patientId}).then(
    function(data)
    {
      if (data.results != "" && data.results!= null)
      {
        $scope.items = data.results
        for (var i = 0; i < $scope.items.length; i++){
          $scope.items[i].acture = $scope.items[i].insertTime
          $scope.items[i].time = $scope.items[i].time.substr(0,10)
          // if ($scope.items[i].url != ""&&$scope.items[i].url!=null)
          // {
          //   $scope.items[i].url = [$scope.items[i].url]
          // }
        }
      };
    },
    function(err)
    {
      console.log(err);
    }
  )


  $scope.gotoHealthDetail=function(ele,editId){
    console.log(ele)
    console.log(ele.target)
    if(ele.target.nodeName=="I"){
      var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '记录删除后将无法恢复，确认删除？',
      cancelText:'取消',
      okText:'删除'
      });

      confirmPopup.then(function(res) {
        if(res) 
          {
            Health.deleteHealth({userId:patientId,insertTime:item.acture}).then(
              function(data)
              {
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (item.acture == $scope.items[i].acture)
                    {
                      $scope.items.splice(i,1)
                      break;
                    }
                  }
                }
                
                console.log($scope.items)
              },
              function(err)
              {
                console.log(err);
              }
            )
            //20140421 zxf
            var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            for(var i=0;i<healthinfotimes.length;i++){
              if(healthinfotimes[i].time==item.acture){
                healthinfotimes.splice(i, 1)
                break;
              }
            }
            Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
            // HealthInfo.remove(number);
            // $scope.items = HealthInfo.getall();
          } 
        });
    }else{
      $state.go('tab.HealthInfoDetail',{id:editId});
    }
    
  }


  $scope.newHealth = function(){
    $state.go('tab.HealthInfoDetail',{id:null});
  }

  // $scope.EditHealth = function(editId){
  //   console.log("健康信息");
  //   console.log(editId);
  //   $state.go('tab.myHealthInfoDetail',{id:editId});
  // }


  
}])


//健康信息--PXY
.controller('HealthInfoCtrl', ['$scope','$timeout','$state','$ionicHistory','$ionicPopup','Storage','Health','Dict',function($scope, $timeout,$state,$ionicHistory,$ionicPopup,Storage,Health,Dict) {
  $scope.barwidth="width:0%";
  //var patientId = Storage.get('getpatientId')
  //console.log(Storage.get('getpatientId'))
  var patientId = 'U201702071766'  //测试ID

  $scope.Goback = function(){
    $state.go('tab.patientDetail')
  }

  //从字典中搜索选中的对象。
  // var searchObj = function(code,array){
  //     for (var i = 0; i < array.length; i++) {
  //       if(array[i].Type == code || array[i].type == code || array[i].code == code) return array[i];
  //     };
  //     return "未填写";
  // }

  $scope.items = []
  

  Health.getAllHealths({userId:patientId}).then(
    function(data)
    {
      if (data.results != "" && data.results!= null)
      {
        $scope.items = data.results
        for (var i = 0; i < $scope.items.length; i++){
          $scope.items[i].acture = $scope.items[i].insertTime
          $scope.items[i].time = $scope.items[i].time.substr(0,10)
          // if ($scope.items[i].url != ""&&$scope.items[i].url!=null)
          // {
          //   $scope.items[i].url = [$scope.items[i].url]
          // }
        }
      };
    },
    function(err)
    {
      console.log(err);
    }
  )


  $scope.gotoHealthDetail=function(ele,editId){
    console.log(ele)
    console.log(ele.target)
    if(ele.target.nodeName=="I"){
      var confirmPopup = $ionicPopup.confirm({
      title: '删除提示',
      template: '记录删除后将无法恢复，确认删除？',
      cancelText:'取消',
      okText:'删除'
      });

      confirmPopup.then(function(res) {
        if(res) 
          {
            Health.deleteHealth({userId:patientId,insertTime:item.acture}).then(
              function(data)
              {
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (item.acture == $scope.items[i].acture)
                    {
                      $scope.items.splice(i,1)
                      break;
                    }
                  }
                }
                
                console.log($scope.items)
              },
              function(err)
              {
                console.log(err);
              }
            )
            //20140421 zxf
            var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            for(var i=0;i<healthinfotimes.length;i++){
              if(healthinfotimes[i].time==item.acture){
                healthinfotimes.splice(i, 1)
                break;
              }
            }
            Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
            // HealthInfo.remove(number);
            // $scope.items = HealthInfo.getall();
          } 
        });
    }else{
      $state.go('tab.HealthInfoDetail',{id:editId});
    }
    
  }


  $scope.newHealth = function(){
    $state.go('tab.HealthInfoDetail',{id:null});

  }

  // $scope.EditHealth = function(editId){
  //   console.log("健康信息");
  //   console.log(editId);
  //   $state.go('tab.myHealthInfoDetail',{id:editId});
  // }


  
}])


//健康详情--PXY
.controller('HealthDetailCtrl', ['ionicDatePicker','$scope','$state','$ionicHistory','$ionicPopup','$stateParams','$ionicPopover','$ionicModal','$ionicScrollDelegate','$ionicLoading','$timeout','Dict','Health','Storage','Camera','wechat','$location',function(ionicDatePicker,$scope, $state,$ionicHistory,$ionicPopup,$stateParams,$ionicPopover,$ionicModal,$ionicScrollDelegate,$ionicLoading,$timeout,Dict,Health,Storage,Camera,wechat,$location) {
  $scope.barwidth="width:0%";
  //var patientId = Storage.get('getpatientId')
  var patientId = 'U201702071766'   //测试ID

  // $scope.test = function(){
  //   console.log($scope.datepickerObject4);
  // }

  $scope.Goback = function(){
        if($scope.canEdit==true){
            $scope.canEdit = false;
        }else{
            if($ionicHistory.backTitle()==null){
                $state.go('tab.HealthInfo');
            }else{
                $ionicHistory.goBack();
            }
            console.log(123);
            console.log($ionicHistory.backTitle());
            
        }
        
    }

    $scope.edit = function(){
        $scope.canEdit = true;
  }
  $scope.$on('$ionicView.enter', function() {
    $scope.healthinfoimgurl = '';
    $ionicModal.fromTemplateUrl('partials/patient/healthinfoimag.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
  })

    //从字典中搜索选中的对象。
  var searchObj = function(code,array){
    for (var i = 0; i < array.length; i++) {
      if(array[i].name == code) return array[i];
    };
    return "未填写";
  }

  // 获取标签类别
  $scope.labels = {}; // 初始化
    $scope.health={
    label:null,
    date:null,
    text:null,
    imgurl:null
  }
  $scope.health.imgurl=[]
  Dict.getHeathLabelInfo({category:"healthInfoType"}).then(
    function(data)
    {
      $scope.labels = data.results.details
      //判断是修改还是新增
      if($stateParams.id!=null && $stateParams!=""){
        //修改
        $scope.canEdit = false;
        var info = $stateParams.id;
        console.log(info)
        Health.getHealthDetail({userId:patientId,insertTime:info.acture}).then(
          function(data)
          {
            if (data.results != "" && data.results != null)
            {
              $scope.health.label = data.results.label
              if ($scope.health.label != null && $scope.health.label != "")
              {
                $scope.health.label = searchObj($scope.health.label,$scope.labels);
                console.log( $scope.health.label);
              }
              $scope.health.date = data.results.time.substr(0,10)
              $scope.health.text = data.results.description
              if (data.results.url != ""&&data.results.url!=null)
              {
                console.log(data.results.url)
                $scope.health.imgurl = data.results.url
                // $scope.showflag=true;
              }
            }
            console.log($scope.health);
          },
          function(err)
          {
            console.log(err);
          }
        )
      }else{
        $scope.canEdit = true;
      }
      console.log($scope.labels);
    },
    function(err)
    {
      console.log(err);
    }
  )
  //angular.toJson fromJson()
  //2017419 zxf
  // var testtt=[];
  // testtt.push("http://121.43.107.106:8052/uploads/photos/")
  // testtt.push("http://121.43.107.10da6:8052/uploads/photos/")
  // Storage.set('test',angular.toJson(testtt))
  // console.log(testtt)
  // console.log(Storage.get('test'))
  // console.log(angular.fromJson(Storage.get('test')))
  // testtt=angular.fromJson(Storage.get('test'))

// Storage.set('localhealthinfoimg',angular.toJson(testtt))
//进入之后local有数据但是不显示
  // $scope.health.imgurl=[];
  // var tmpimgurl=Storage.get('localhealthinfoimg');
  // console.log(tmpimgurl)
  // if(tmpimgurl!=""&&tmpimgurl!=null){
  //   console.log(tmpimgurl)
  //   $scope.health.imgurl=angular.fromJson(tmpimgurl);
  //   console.log($scope.health.imgurl)
  //   $scope.showflag=true;
  // }

  
  console.log($ionicHistory.backView())
  $scope.HealthInfoSetup = function(){
    if($scope.health.label!=""&&$scope.health.text!=""&&$scope.health.date!=""){
      console.log($stateParams.id)
        if($stateParams.id==null||$stateParams==""){
            Health.createHealth({userId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:""}).then(
              function(data)
              {
                console.log(data.results);
                console.log(data.results.insertTime);
                $scope.canEdit= false;
                var healthinfoToconsult=[]
                //从咨询过来的需要返回对应的健康信息
                if($ionicHistory.backView()!=null&&$ionicHistory.backView().stateName=='tab.consultquestion2'){
                  if(Storage.get('consulthealthinfo')==''||Storage.get('consulthealthinfo')==null||Storage.get('consulthealthinfo')=='undefined'){
                    healthinfoToconsult.push({'time':data.results.insertTime})
                  }else{
                    healthinfoToconsult=angular.fromJson(Storage.get('consulthealthinfo'))
                    healthinfoToconsult.push({'time':data.results.insertTime})
                  }
                  Storage.set('consulthealthinfo',angular.toJson(healthinfoToconsult))
                  console.log(Storage.get('consulthealthinfo'))
                }


                $ionicHistory.goBack()
              },
              function(err)
              {
                console.log(err);
              }
            )
        }
        else{
            var curdate=new Date();
            Health.modifyHealth({userId:patientId,type:$scope.health.label.code,time:$scope.health.date,url:$scope.health.imgurl,label:$scope.health.label.name,description:$scope.health.text,comments:"",insertTime:$stateParams.id.insertTime}).then(
              function(data)
              {
                console.log(data.results);
                $scope.canEdit= false;
                // $ionicHistory.goBack()
              },
              function(err)
              {
                console.log(err);
              }
            )
        }
    }
    else{
        $ionicLoading.show({
            template:'信息填写不完整',
            duration:1000
        });
    }

}

  var datepickerD = {
        callback: function (val) {  //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.health.date=new Date(val);
        },
        titleLabel: '添加日期',
        inputDate: new Date(),
        mondayFirst: true,
        closeOnSelect: false,
        templateType: 'popup',
        setLabel: '确定',
        todayLabel: '今天',
        closeLabel: '取消',
        showTodayButton: true,
        dateFormat: 'yyyy MMMM dd',
        weeksList: ["周日","周一","周二","周三","周四","周五","周六"],
        monthsList:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
    };
    $scope.openDatePicker = function(){
        ionicDatePicker.openDatePicker(datepickerD);
    };



  // --------datepicker设置----------------
  // var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  // var weekDaysList=["日","一","二","三","四","五","六"];
  // var datePickerCallback = function (val) {
  //   if (typeof(val) === 'undefined') {
  //     console.log('No date selected');
  //   } else {
  //     $scope.datepickerObject4.inputDate=val;
  //     var dd=val.getDate();
  //     var mm=val.getMonth()+1;
  //     var yyyy=val.getFullYear();
  //     var d=dd<10?('0'+String(dd)):String(dd);
  //     var m=mm<10?('0'+String(mm)):String(mm);
  //     //日期的存储格式和显示格式不一致
  //     $scope.health.date=yyyy+'-'+m+'-'+d;
  //   }
  // };

  // $scope.datepickerObject4 = {
  //   titleLabel: '时间日期',  //Optional
  //   todayLabel: '今天',  //Optional
  //   closeLabel: '取消',  //Optional
  //   setLabel: '设置',  //Optional
  //   setButtonType : 'button-assertive',  //Optional
  //   todayButtonType : 'button-assertive',  //Optional
  //   closeButtonType : 'button-assertive',  //Optional
  //   mondayFirst: false,    //Optional
  //   //disabledDates: disabledDates, //Optional
  //   weekDaysList: weekDaysList,   //Optional
  //   monthList: monthList, //Optional
  //   templateType: 'popup', //Optional
  //   showTodayButton: 'false', //Optional
  //   modalHeaderColor: 'bar-positive', //Optional
  //   modalFooterColor: 'bar-positive', //Optional
  //   from: new Date(1900, 1, 1),   //Optional
  //   to: new Date(),    //Optional
  //   callback: function (val) {    //Mandatory
  //     datePickerCallback(val);
  //   }
  // };  
//--------------copy from minectrl
  // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function($event){
    $scope.openPopover($event);
  };
 
 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function(serverId){
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" + new Date().getTime() + "healthinfo.jpg";
    console.log(temp_photoaddress)
    wechat.download({serverId:serverId, name:temp_name})
    .then(function(res){
      // var data=angular.fromJson(res)
      //图片路径
      $scope.health.imgurl.push("http://121.43.107.106:8052/"+temp_photoaddress
      // $state.reload("tab.mine")
      // Storage.set('localhealthinfoimg',angular.toJson($scope.health.imgurl));
      console.log($scope.health.imgurl)
      // $scope.showflag=true;
    },function(err){
      console.log(err);
      reject(err);
    })
  };
//-----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        //--------------------------------------------
        // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  // 相册键的点击事件---------------------------------
  $scope.onClickCameraPhotos = function(){        
   // console.log("选个照片"); 
   $scope.choosePhotos();
   $scope.closePopover();
  };      
  $scope.choosePhotos = function() {
    var config = "";
    wechat.settingConfig({url:$location.absUrl()}).then(function(data){
      // alert(data.results.timestamp)
      config = data.results;
      config.jsApiList = ['chooseImage','uploadImage']
      // alert(config.jsApiList)
      // alert(config.debug)
      wx.config({
        debug:true,
        appId:config.appId,
        timestamp:config.timestamp,
        nonceStr:config.nonceStr,
        signature:config.signature,
        jsApiList:config.jsApiList
      })
      wx.ready(function(){
        wx.checkJsApi({
            jsApiList: ['chooseImage','uploadImage'],
            success: function(res) {
                wx.chooseImage({
                  count:1,
                  sizeType: ['original','compressed'],
                  sourceType: ['album'],
                  success: function(res) {
                    var localIds = res.localIds;
                    wx.uploadImage({
                       localId: localIds[0],
                       isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            var serverId = res.serverId; // 返回图片的服务器端ID
                            photo_upload_display(serverId);
                        }
                    })
                  }
                })
            }
        });
      })
      wx.error(function(res){
        alert(res.errMsg)
      })

    },function(err){

    })
  }; // function结束


  // 照相机的点击事件----------------------------------
  $scope.getPhoto = function() {
    // console.log("要拍照了！");
    $scope.takePicture();
    $scope.closePopover();
  };
  $scope.isShow=true;
  $scope.takePicture = function() {
      var config = "";
      wechat.settingConfig({url:$location.absUrl()}).then(function(data){
        // alert(data.results.timestamp)
        config = data.results;
        config.jsApiList = ['chooseImage','uploadImage']
        // alert(config.jsApiList)
        // alert(config.debug)
        wx.config({
          debug:true,
          appId:config.appId,
          timestamp:config.timestamp,
          nonceStr:config.nonceStr,
          signature:config.signature,
          jsApiList:config.jsApiList
        })
        wx.ready(function(){
          wx.checkJsApi({
          jsApiList: ['chooseImage','uploadImage'],
          success: function(res) {
              wx.chooseImage({
                count:1,
                sizeType: ['original','compressed'],
                sourceType: ['camera'],
                success: function(res) {
                    var localIds = res.localIds;
                    wx.uploadImage({
                       localId: localIds[0],
                       isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (res) {
                            var serverId = res.serverId; // 返回图片的服务器端ID
                            photo_upload_display(serverId);
                        }
                    })
                }
              })
          }
          });
        })
      wx.error(function(res){
        alert(res.errMsg)
      })

      },function(err){

      })
    }; // function结束



    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

  //点击图片返回
  $scope.imggoback = function(){
    $scope.modal.hide();
  };
  $scope.showoriginal=function(resizedpath){
    $scope.openModal();
    console.log(resizedpath)
    var originalfilepath="http://121.43.107.106:8052/uploads/photos/"+resizedpath.slice(resizedpath.lastIndexOf('/')+1).substr(7)
    console.log(originalfilepath)
    $scope.healthinfoimgurl=originalfilepath;
  }
  $scope.deleteimg=function(index){
    //somearray.removeByValue("tue");
    console.log($scope.health.imgurl)
    $scope.health.imgurl.splice(index, 1)
    // Storage.set('tempimgrul',angular.toJson($scope.images));
  }

  $scope.$on('$ionicView.leave', function() {
    $scope.modal.remove();
  })



  
}])



//消息类型--PXY
.controller('VaryMessageCtrl', ['$scope','$state','$ionicHistory','Storage',function($scope, $state,$ionicHistory,Storage) {

    var messageType = Storage.get("getMessageType")
    $scope.messages=angular.fromJson(Storage.get("allMessages"))[messageType]
    console.log($scope.messages)

    if(messageType=='ZF')
        $scope.avatar='payment.png'
    else if(messageType=='JB')
        $scope.avatar='alert.png'
    else if(messageType=='RW')
        $scope.avatar='task.png'
    else if(messageType=='BX')
        $scope.avatar='security.png'

    $scope.Goback = function(){
        $ionicHistory.goBack();
    }

  
}])
//消息中心--PXY
.controller('messageCtrl', ['$scope','$state','$ionicHistory','Dict','Message','Storage',function($scope, $state,$ionicHistory,Dict,Message,Storage) {
    $scope.barwidth="width:0%";
    //get all message types
    Dict.typeOne({category:'MessageType'})
    .then(function(data)
    {
        // console.log(data.results.details)
        var messages={};
        angular.forEach(data.results.details,function(value,key)
        {
            // console.log(value)
            messages[value.inputCode]={name:value.name,code:value.code,values:[]};
        })
        // console.log(messages)
        Message.getMessages({userId:'U201704120001',type:""})//Storage.get('UID')
        .then(function(data)
        {
            // console.log(data)
            angular.forEach(data.results,function(value,key)
            {
                // console.log(value)
                if(value.type==1)//支付消息
                {
                    messages.ZF.values.push(value)
                }
                else if(value.type==2)//警报消息
                {
                    messages.JB.values.push(value)
                }
                else if(value.type==3)//任务消息
                {   
                    messages.RW.values.push(value)
                }
                else if(value.type==4)//聊天消息
                {
                    messages.LT.values.push(value)
                }
                else if(value.type==5)//保险消息
                {
                    messages.BX.values.push(value)
                }
            })
            console.log(messages)
            Storage.set("allMessages",angular.toJson(messages));
            $scope.messages=messages;
        },function(err)
        {
            console.log(err)
        })
    },function(err)
    {
        console.log(err)
    })

  $scope.Goback = function(){
    $ionicHistory.goBack();
  }

    $scope.getMessageDetail = function(type){
        Storage.set("getMessageType",type);
        $state.go('messagesDetail');
    }
  //查询余额等等。。。。。
  // $scope.messages =[
  // {
  //   img:"img/default_user.png",
  //   name:"支付消息",
  //   type:1,
  //   time:"2017/04/01",
  //   response:"恭喜你！成功充值50元，交易账号为0093842345."
  // },
  // {
  //   img:"img/default_user.png",
  //   name:"任务消息",
  //   type:2,
  //   time:"2017/03/21",
  //   response:"今天还没有测量血压，请及时完成！"

  // },
  // {
  //   img:"img/default_user.png",
  //   name:"警报消息",
  //   type:3,
  //   time:"2017/03/11",
  //   response:"你的血压值已超出控制范围！"

  // }]


  // $scope.consults =[
  // {
  //   img:"img/default_user.png",
  //   name:"李芳",
  //   time:"2017/03/04",
  //   response:"您好,糖尿病患者出现肾病的,一般会出现低蛋白血症.低蛋白血症患者一般会出现浮肿.治疗浮肿时就需要适当的补充蛋白,但我们一般提倡使用优质蛋白,我不知道您的蛋白粉是不是植物蛋白,所以您还是慎重一点好."

  // },
  // {
  //   img:"img/default_user.png",
  //   name:"张三",
  //   time:"2017/03/01",
  //   response:"糖尿病肾损害的发生发展分5期.Ⅰ期,为糖尿病初期,肾体积增大,肾小球滤过滤增高,肾小球入球小动脉扩张,肾小球内压升高.Ⅱ期,肾小球毛细血管基底膜增厚,尿白蛋白排泄率多正常,或间歇性升高。"

  // }
  

  // ]
    

  
}])
// .controller('groupQRCodeCtrl', ['$scope', 'Storage', function ($scope, Storage) {
//   $scope.groupQRCodedata = "www.baidu.com"
// }])
