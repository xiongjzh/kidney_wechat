/**
 * Created by yc on 2017/5/11.
 */
angular.module('kidney.icon_filter', [])
.filter('icon_filter',[function () {
   return function (type) {
      var _src;
     switch (type){
       case '体温':
        _src = 'img/icon_tiwen@2x.png';
        break;
      case '体重':
       _src = 'img/icon_tizhong@2x.png';
       break;
     case '血压':
       _src = 'img/icon_xueya@3x.png';
       break;
     case '尿量':
       _src = 'img/icon_huayan@2x.png';
       break;
     case '心率':
       _src = 'img/icon_xinlv@2x.png';
       break;
     case '复诊':
       _src = 'img/icon_fuzhen@2x.png';
       break;
     case '化验':
       _src = 'img/icon_huayan@2x.png';
       break;
     case '特殊评估':
       _src = 'img/icon_pinggu@2x.png';
       break;
     }
    return _src;
   }




}])