angular.module('tdy.controllers', ['ionic','kidney.services','ionic-datepicker'])

/////////////////////////tongdanyang/////////////////
.controller('DoctorDiagnoseCtrl', ['$scope', 'Storage','ionicDatePicker','Patient','$state', function ($scope, Storage,ionicDatePicker,Patient,$state) {
  
  var decodeDiseases=function(type)
  {
    var dict;
    switch(type)
    {
      case '2':
        dict="class_2";
        break;
      case '3':
        dict="class_3";
        break;
      case '4':
        dict="class_4";
        break;
      case '5':
        dict="class_6";
        break;
      case '6':
        dict="class_5";
        break;
      case '1':
        dict="class_1";
        break;
    }
    return dict;
  }
  var encodeDiseases=function(dict)
  {
    var type;
    switch(dict)
    {
      case "class_2":
        type='2';
        break;
      case "class_3":
        type='3';
        break;
      case "class_4":
        type='4';
        break;
      case "class_6":
        type='5';
        break;
      case "class_5":
        type='6';
        break;
      case "class_1":
        type='1';
        break;
    }
    return type;
  }
  var decodeprogress=function(type)
  {
    var dict;
    switch(type)
    {
      case '疾病活跃期':
        dict="stage_5";
        break;
      case '稳定期':
        dict="stage_6";
        break;
      case '>3年':
        dict="stage_7";
        break;
    }
    return dict;
  }
  var encodeprogress=function(dict)
  {
    var type;
    switch(dict)
    {
      case "stage_5":
        type='疾病活跃期';
        break;
      case "stage_6":
        type='稳定期';
        break;
      case "stage_7":
        type='>3年';
        break;
    }
    return type;
  }
  $scope.Hypers =
  [
    {Name:"是",Type:'1'},
    {Name:"否",Type:'2'}
  ]
  $scope.edit=false;
  var tmpDiagnose;
  $scope.canEdit=function()
  {
    $scope.edit=~$scope.edit;
    if($scope.edit)
    {
      tmpDiagnose=angular.copy($scope.Diagnose);
    }
    else
    {
      // console.log(tmpDiagnose)
      $scope.Diagnose=angular.copy(tmpDiagnose);
    }
  }
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
  // console.log(latestDiagnose)
  $scope.Diagnose = 
  {
    "diagname": encodeDiseases(latestDiagnose.name),
    "diagtime": (new Date()).toDateString(),
    "diagoperationTime": latestDiagnose.operationTime==undefined?(new Date()).toDateString():latestDiagnose.operationTime,
    "diaghypertension": ""+latestDiagnose.hypertension,
    "diagprogress": encodeprogress(latestDiagnose.progress),
    "diagcontent":latestDiagnose.content
  }
  console.log($scope.Diagnose)
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

  $scope.saveDiagnose=function()
  {
    $scope.Diagnose.patientId=Storage.get('getpatientId');
    $scope.Diagnose.doctorId=Storage.get('UID');
    $scope.Diagnose.diagname=decodeDiseases($scope.Diagnose.diagname);
    $scope.Diagnose.diagprogress=decodeprogress($scope.Diagnose.diagprogress);
    // console.log($scope.Diagnose)

    Patient.insertDiagnosis($scope.Diagnose)
    .then(function(data){
      // console.log(data)
      var lD={
          content:$scope.Diagnose.diagcontent,
          hypertension:$scope.Diagnose.diaghypertension,
          name:$scope.Diagnose.diagname,
          operationTime:$scope.Diagnose.diagoperationTime,
          progress:$scope.Diagnose.diagprogress,
          time:$scope.Diagnose.diagtime
      }
      Storage.set("latestDiagnose",angular.toJson(lD));
      
      $scope.Diagnose.diagname=encodeDiseases($scope.Diagnose.diagname);
      $scope.Diagnose.diagprogress=encodeprogress($scope.Diagnose.diagprogress);

      tmpDiagnose=angular.copy($scope.Diagnose);
      $scope.canEdit();
      // $state.go('tab.patientDetail');
    },function(err)
    {
      console.log(err)
    })
  }

}])
.controller('TestRecordCtrl', ['$scope', '$http','$stateParams','Storage','VitalSign', function ($scope,$http,$stateParams,Storage,VitalSign) {
  

      console.log($stateParams.PatinetId)
      console.log(Storage.get("getpatientId"))
      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          // if(Data.results[i].date>="2017-04-08"&&Data.results[i].code=="舒张压"){
          if(Data.results[i].code=="舒张压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          console.log($scope.ChartData)
          $scope.chartdiv=false;
        }else{
          $scope.chartdiv=true;
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
        }
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"舒张压","mmHg");
      }, function(e) {  
      });

      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'血压'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="收缩压"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          $scope.chartdiv1=false;
        }else{
          $scope.chartdiv1=true;
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
        }
        // console.log($scope.ChartData);
        // createStockChart("chartdiv",$scope.ChartData,"收缩压","mmHg");
      }, function(e) {  
      });

      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'体温'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体温"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          $scope.chartdiv2=false;
        }else{
          $scope.chartdiv2=true;
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
        }

      }, function(e) {  
      });
      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'体重'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="体重"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          $scope.chartdiv3=false;
        }else{
          $scope.chartdiv3=true;
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
        }

      }, function(e) {  
      });
      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'尿量'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="尿量"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          $scope.chartdiv4=false;
        }else{
          $scope.chartdiv4=true;
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
        }

      }, function(e) {  
      });
      VitalSign.getVitalSigns({userId:Storage.get("getpatientId"),type:'心率'}).then(
      function(Data){
        $scope.ChartData=[];
        console.log(Data.results.length)
        for(var i=0;i<Data.results.length;i++){
          if(Data.results[i].code=="心率"){
            for(var j=0;j<Data.results[i].data.length;j++){
              $scope.ChartData.push(Data.results[i].data[j])
            }
          }
        }
        if($scope.ChartData.length==0){
          $scope.chartdiv5=false;
        }else{
          $scope.chartdiv5=true;
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
        }

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
.controller('TaskSetCtrl', ['$scope', '$state', '$ionicPopup', 'Storage', 'Task', function ($scope, $state, $ionicPopup, Storage, Task) {
  //初始化
   var UserId = Storage.get('getpatientId'); 
   //var UserId = "Test09";
   $scope.Tasks = [];
   $scope.EditTasks = []; //修改任务
   $scope.$on('$ionicView.enter', function() {
        GetTasks();
   }); 
   var index = 0;//方法调用计数

  //获取对应任务模板
    function GetTasks(TaskCode)
    {     
       var promise =  Task.getUserTask({userId:UserId});
       promise.then(function(data){
         if(data.result.length != 0)
         {
            $scope.Tasks = data.result.task;
            //console.log($scope.Tasks);
            HandleTasks();
         }
       },function(){
                      
       })
    }

  //获取任务后处理
    function HandleTasks()
    {                       
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
                $scope.Tasks.Measure[j].type = task.type;               
            }
         }
         else
         {
            for(var j=0;j<task.details.length;j++)
            {
               var newTask = task.details[j];       
               if(newTask.times != 0)
               {
                 newTask.type = task.type;
                 if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
                 {
                    newTask.dateStr = newTask.content;
                    newTask.content = newTask.instruction;
                 }    
                 newTask.Name = NameMatch(newTask.type);               
                 $scope.Tasks.Other.push(newTask);   
               }
            }                        
         }   
      }
    }

  //修改任务模板
   function UpdateUserTask()
    {
      if(index < $scope.EditTasks.length)
      {
        var temp = $scope.EditTasks[index];
        var task = {
                            "userId":UserId, 
                            "type":temp.type, 
                            "code":temp.code, 
                            "instruction":temp.instruction, 
                            "content":temp.content, 
                            "startTime":temp.startTime, 
                            "endTime":temp.endTime, 
                            "times":temp.times,
                            "timesUnits":temp.timesUnits, 
                            "frequencyTimes":temp.frequencyTimes, 
                            "frequencyUnits":temp.frequencyUnits
                    };
        var promise = Task.updateUserTask(task);
         promise.then(function(data){
         if(data.results)
         { 
           //task.Flag = true;
           //console.log(task.code);
           index = index + 1; 
           if(index == $scope.EditTasks.length)
           {
             $state.go('tab.patientDetail');
           }
           else
           {
             UpdateUserTask();      
           }                  
         };
         },function(){                    
         })
      }
      
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
                 {Name:'特殊评估', Code:'SpecialEvaluate'},
                 {Name:'血管通路情况', Code:'VascularAccess'},
                 {Name:'腹透', Code:'PeritonealDialysis'},
                 {Name:'超滤量', Code:'cll'},
                 {Name:'浮肿', Code:'ywfz'},
                 {Name:'引流通畅', Code:'yl'}
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
       UpdateUserTask();                  
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
          task.content = res;
          var flag = false;
          var newTask = JSON.parse(JSON.stringify(task));
          newTask.Flag = false;
          if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
          {
             newTask.instruction = newTask.content;
             newTask.content = newTask.dateStr;
          }
          for(var i=0;i<$scope.EditTasks.length;i++)
          {
             if($scope.EditTasks[i].Name == newTask.Name)
             {
                $scope.EditTasks[i] = newTask;
                flag = true;
                break;
             }
          }
          if(!flag)
          {
             $scope.EditTasks.push(newTask);
          }
        } 
        //console.log( $scope.Tasks);
      });
    };

  //修改任务执行频率
    $scope.ChangeFreq = function (item)
    {
      var newTask = JSON.parse(JSON.stringify(item));
      var flag = false;
      if((newTask.type == "ReturnVisit") && (newTask.code == "stage_9"))//血透
      {
         newTask.instruction = newTask.content;
         newTask.content = newTask.dateStr;
      }
      for(var i=0;i<$scope.EditTasks.length;i++)
      { 
         var task = $scope.EditTasks[i]
         if(task.Name == newTask.Name)
         {
            task = newTask;
            flag = true;
         }
      }
      if(!flag)
      {
         newTask.Flag = false;
         $scope.EditTasks.push(newTask);
      }      
    }

}])

//健康信息--PXY
.controller('HealthInfoCtrl', ['$scope','$timeout','$state','$ionicHistory','$ionicPopup','Storage','Health','Dict',function($scope, $timeout,$state,$ionicHistory,$ionicPopup,Storage,Health,Dict) {
  $scope.barwidth="width:0%";
  var patientId = Storage.get('getpatientId')
  //console.log(Storage.get('getpatientId'))
  // var patientId = 'U201702071766'  //测试ID

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
        //console.log($scope.items)
        //var testtime=$scope.items[0]
        //console.log(testtime)
        for (var i = 0; i < $scope.items.length; i++){
          $scope.items[i].acture = $scope.items[i].insertTime
          //$scope.items[i].time = $scope.items[i].time.substr(0,10)
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
            Health.deleteHealth({userId:patientId,insertTime:editId.acture}).then(
              function(data)
              {
                if (data.results == 0)
                {
                  for (var i = 0; i < $scope.items.length; i++){
                    if (editId.acture == $scope.items[i].acture)
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
            // var healthinfotimes=angular.fromJson(Storage.get('consulthealthinfo'))
            // for(var i=0;i<healthinfotimes.length;i++){
            //   if(healthinfotimes[i].time==item.acture){
            //     healthinfotimes.splice(i, 1)
            //     break;
            //   }
            // }
            // Storage.set('consulthealthinfo',angular.toJson(healthinfotimes))
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
  var patientId = Storage.get('getpatientId')
  // var patientId = 'U201702071766'   //测试ID

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

    $scope.healthinfoimgurl = '';
          $ionicModal.fromTemplateUrl('partials/patient/healthinfoimag.html', {
              scope: $scope,
              animation: 'slide-in-up'
            }).then(function(modal) {
              $scope.modal = modal;
            });  

    $scope.edit = function(){
        $scope.canEdit = true;
  }

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
              $scope.health.date = data.results.time
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
                // if($ionicHistory.backView()!=null&&$ionicHistory.backView().stateName=='tab.consultquestion2'){
                //   if(Storage.get('consulthealthinfo')==''||Storage.get('consulthealthinfo')==null||Storage.get('consulthealthinfo')=='undefined'){
                //     healthinfoToconsult.push({'time':data.results.insertTime})
                //   }else{
                //     healthinfoToconsult=angular.fromJson(Storage.get('consulthealthinfo'))
                //     healthinfoToconsult.push({'time':data.results.insertTime})
                //   }
                //   Storage.set('consulthealthinfo',angular.toJson(healthinfoToconsult))
                //   console.log(Storage.get('consulthealthinfo'))
                // }


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
                console.log(data.data);
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

    var ipObj1 = {
        callback: function (val) {  //Mandatory
            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            var date=new Date(val)
            date.setHours(8)
            $scope.health.date = date.toUTCString();
            console.log($scope.health.date);
            console.log(date);       
        },
        titleLabel: '日期选择',
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

    $scope.openDatePicker = function(params){
        ionicDatePicker.openDatePicker(ipObj1);
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
    $ionicLoading.show({
      template:'图片更新中',
      duration:5000
    })
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" + new Date().getTime() + "healthinfo.jpg";
    console.log(temp_photoaddress)
    wechat.download({serverId:serverId, name:temp_photoaddress})
    .then(function(res){
      // var data=angular.fromJson(res)
      //图片路径
      $timeout(function(){
        $ionicLoading.hide();
        $scope.health.imgurl.push("http://121.43.107.106:8052/uploads/photos/"+temp_photoaddress)
      },1000)
      
      
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
  $ionicPopover.fromTemplateUrl('my-popover1.html', {
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
    var path = "http://test.go5le.net/?code=" + Storage.get('code');
    wechat.settingConfig({url:path}).then(function(data){
      // alert(data.results.timestamp)
      config = data.results;
      config.jsApiList = ['chooseImage','uploadImage']
      // alert(config.jsApiList)
      // alert(config.debug)
      wx.config({
        debug:false,
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
      var path = "http://test.go5le.net/?code=" + Storage.get('code');
      wechat.settingConfig({url:path}).then(function(data){
        // alert(data.results.timestamp)
        config = data.results;
        config.jsApiList = ['chooseImage','uploadImage']
        // alert(config.jsApiList)
        // alert(config.debug)
        wx.config({
          debug:false,
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
    var originalfilepath="http://121.43.107.106:8052/uploads/photos/"+resizedpath.slice(resizedpath.lastIndexOf('/')+1)
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
        Message.getMessages({userId:Storage.get('UID'),type:""})//Storage.get('UID')
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
