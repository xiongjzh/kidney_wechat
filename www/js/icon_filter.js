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
     case '腹透':
       _src = 'img/icon_futou@2x.png';
       break;
     case '超滤量':
       _src = 'img/icon_chaolv@2x.png';
       break;
     case '浮肿':
       _src = 'img/icon_fuzhong@2x.png';
       break;
     case '引流通畅':
       _src = 'img/icon_yinliu@2x.png';
       break; 
     case '血管通路情况':
       _src = 'img/icon_xueguan@2x.png';
       break;        
     }
    return _src;
   }




}])