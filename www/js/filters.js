angular.module('kidney.filters', [])
//毫秒数 to '10:32 AM' or '4/1/17 4:55 PM'（不是当天的话）
.filter('msgdate',['$filter',function($filter){
    return function(milliseconds){
        var curTime = new Date();
        var msgTime = new Date(milliseconds);
        if(curTime.toDateString()==msgTime.toDateString()) return $filter('date')(msgTime, 'h:mm a');
        return $filter('date')(msgTime, 'M/d/yy h:mm a');
    }
}])
//解决 Blocked loading resource from url not allowed by $sceDelegate policy
.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])
.filter('filterGender',[function(){
    return function(gender){
        var g="未知";
        if(gender==1)
        	g='男'
        if(gender==0)
        	g='女'
        return g;
    }
}])
.filter('diagname',[function(){
    return function(type){
        var name;
        switch(type)
        {
          case '2':
            name="CKD1-2期";
            break;
          case '3':
            name="CKD3-4期";
            break;
          case '4':
            name="CDK5期未透析";
            break;
          case '5':
            name="腹透";
            break;
          case '6':
            name="血透";
            break;
          case '1':
            name="肾移植";
            break;
        }
        return name;
    }
}])
.filter('hypertension',[function(){
    return function(type){
        var name="--";
        switch(type)
        {
          case '1':
            name="是";
            break;
          case '2':
            name="否";
            break;
        }
        return name;
    }
}])
.filter('filterAge',[function(){
    return function(date){
        var d=new Date(date)
        var dateNow=new Date()
        return dateNow.getFullYear()-d.getFullYear();
    }
}])

.filter('filterVIP',[function(){
    return function(VIP){
        var g="未知";
        if(VIP==1)
            g='是'
        if(VIP==0)
            g='否'
        return g;
    }
}])
.filter('filterhypertension',[function(){
    return function(hypertension){
        var g="未知";
        if(hypertension==1)
            g='是'
        if(hypertension==0)
            g='否'
        return g;
    }
}])

.filter('imgUrl',[function(){
    return function(date,type){
        var url="http://121.43.107.106:8052/uploads/photos/"
        if(type=="doctor")
            url+="doctor.png"
        else if(type=="group")
            url="img/doctor_group.png"
        else if(type=="patient")
            url+="patient.png"
        return url;
    }
}])
.filter('dateFormat',[function(){
    return function(date,format){
        var d=new Date(date)
        var ret=""
        if(date==null)
        	return "-"
        switch(format)
        {
        	case "YYYY-MM-DD":
        		ret=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
        		break;
        	case "MM-DD-YYYY":
        		ret=(d.getMonth()+1)+'-'+d.getDate()+'-'+d.getFullYear();
        		break;
        	case "YYYY-MM-DD h:m":
        		ret=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes();
        		break;
        }
        return ret;
    }
}])