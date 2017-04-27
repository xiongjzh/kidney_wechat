angular.module('zy.controllers', ['ionic','kidney.services'])

/////////////////////////////zhangying///////////////////////
//登录
.controller('SignInCtrl', ['User','$scope','$timeout','$state','Storage','loginFactory','$ionicHistory','JM', '$location','wechat','$window','$rootScope','Doctor',function(User,$scope, $timeout,$state,Storage,loginFactory,$ionicHistory,JM,$location,wechat,$window,$rootScope,Doctor) {

    $scope.barwidth="width:0%";

    if(Storage.get('USERNAME')!=null){
        $scope.logOn={username:Storage.get('USERNAME'),password:""};
    }
    else{
        $scope.logOn={username:"",password:""};
    }
    $scope.signIn = function(logOn) {  
        $scope.logStatus='';

    // //暂时写在这，交流用 XJZ
    // window.JMessage.login(logOn.username, logOn.username,
    //     function(response) {
    //         window.JMessage.username = user
    //         //gotoConversation();
    //     },
    //     function(err) {
    //         console.log(err);
    //         // JM.register($scope.useruserID, $scope.passwd);
    //     });

        if((logOn.username!="") && (logOn.password!="")){
            var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            //手机正则表达式验证
            if(!phoneReg.test(logOn.username)){
                $scope.logStatus="手机号验证失败！";
                return;
            }
            else{
                var logPromise = User.logIn({username:logOn.username,password:logOn.password,role:"doctor"});
                logPromise.then(function(data){
                    if(data.results==1){
                        if(data.mesg== "User doesn't Exist!"){
                            $scope.logStatus="账号不存在！";
                        }
                        else if(data.mesg== "User password isn't correct!"){
                            $scope.logStatus = "账号或密码错误！";
                        }
                    }
                    else if(data.results.mesg=="login success!"){

                        $scope.logStatus = "登录成功！";
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        Storage.set('USERNAME',$scope.logOn.username);
                        Storage.set('TOKEN',data.results.token);//token作用目前还不明确
                        Storage.set('isSignIn',true);
                        Storage.set('UID',data.results.userId);

                        // Doctor.getDoctorInfo({userId:data.results.userId})
                        // .then(function(response){
                        //     socket = io.connect('ws://121.43.107.106:4050/chat');
                        //     socket.emit('newUser',{user_name:response.results.name,user_id:data.results.userId});
                        //     socket.on('err',function(data){
                        //         console.log(data)
                        //         // $rootScope.$broadcast('receiveMessage',data);
                        //     });
                        //     socket.on('onlineCount',function(data){
                        //         console.info('onlineCount');
                        //         console.log(data);
                        //         // $rootScope.$broadcast('receiveMessage',data);
                        //     });
                        //     socket.on('getMsg',function(data){
                        //         console.info('getMsg');
                        //         console.log(data);
                        //         $rootScope.$broadcast('receiveMessage',data);
                        //     });
                        //     socket.on('messageRes',function(data){
                        //         console.info('messageRes');
                        //         console.log(data);
                        //         $rootScope.$broadcast('messageResponse',data);
                        //     });
                        // },function(err){
                        //     reject(err);
                        // }) 
                        // socket = io.connect('ws://121.43.107.106:4050/chat');
                        // socket.emit('newUser',{user_name:response.results.name,user_id:data.results.userId});
                        // socket.on('err',function(data){
                        //     console.log(data)
                        //     // $rootScope.$broadcast('receiveMessage',data);
                        // });
                        // socket.on('onlineCount',function(data){
                        //     console.info('onlineCount');
                        //     console.log(data);
                        //     // $rootScope.$broadcast('receiveMessage',data);
                        // });
                        // socket.on('getMsg',function(data){
                        //     console.info('getMsg');
                        //     console.log(data);
                        //     $rootScope.$broadcast('receiveMessage',data);
                        // });

                        User.getAgree({userId:data.results.userId}).then(function(res){
                            if(res.results.agreement=="0"){
                                $timeout(function(){$state.go('tab.home');},500);
                            }else{
                                $timeout(function(){$state.go('agreement',{last:'signin'});},500);
                            }
                        },function(err){
                            console.log(err);
                        })

                    }
                },
                function(data){
                    if(data.results==null && data.status==0){
                        $scope.logStatus = "网络错误！";
                        return;
                    }
                    if(data.status==404){
                        $scope.logStatus = "连接服务器失败！";
                        return;
                    }
                });
            }     
        }
        else{
            $scope.logStatus="请输入完整信息！";
        }
    }

    $scope.toRegister = function(){
        console.log($state);
        Storage.set('validMode',0);//注册
        $state.go('phonevalid');     
    }

    $scope.toReset = function(){
        Storage.set('validMode',1);//修改密码
        $state.go('phonevalid');   
    } 
  
}])


//手机号码验证
.controller('phonevalidCtrl', ['$scope','$state','$interval', '$stateParams','Storage','User','$timeout',  function($scope, $state,$interval,$stateParams,Storage,User,$timeout) {
    $scope.barwidth="width:0%";
    $scope.Verify={Phone:"",Code:""};
    $scope.veritext="获取验证码";
    $scope.isable=false;
    var validMode=Storage.get('validMode');//0->set;1->reset
    var unablebutton = function(){      
     //验证码BUTTON效果
        $scope.isable=true;
        console.log($scope.isable)
        $scope.veritext="180S再次发送"; 
        var time = 179;
        var timer;
        timer = $interval(function(){
            if(time==0){
            $interval.cancel(timer);
            timer=undefined;        
            $scope.veritext="获取验证码";       
            $scope.isable=false;
        }else{
            $scope.veritext=time+"S再次发送";
            time--;
            }
        },1000);
    }
    var isregisted = false;
    //点击获取验证码
    $scope.getcode=function(Verify){
        $scope.logStatus='';
    
        if (Verify.Phone=="") {
      
        $scope.logStatus="手机号码不能为空！";
        return;
        }
        var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        //手机正则表达式验证
        if(!phoneReg.test(Verify.Phone))
        {
            $scope.logStatus="请输入正确的手机号码！";
              return;
        }
        else//通过基本验证-正确的手机号
        {
            console.log(Verify.Phone)
            //验证手机号是否注册，没有注册的手机号不允许重置密码
            User.logIn({
                username:Verify.Phone,
                password:' ',
                role:'doctor'
            })
            .then(function(succ)
            {
                console.log(succ)
                if($stateParams.phonevalidType=='wechat'){
                        if (succ.mesg=="User password isn't correct!")
                        {
                            $scope.logStatus = "该手机号码已经注册,请验证手机号绑定微信";
                            isregisted = true
                            User.sendSMS({
                                mobile:Verify.Phone,
                                smsType:1
                            })
                            .then(function(validCode)
                            {
                                console.log(validCode)
                                if(validCode.results==0)
                                {
                                    unablebutton()
                                    if(validCode.mesg.match("您的邀请码")=="您的邀请码")
                                    {
                                        $scope.logStatus="请稍后获取验证码";
                                    }
                                }
                                else
                                {
                                    $scope.logStatus="验证码发送失败！";
                                }
                            },function(err)
                            {
                                $scope.logStatus="验证码发送失败！";
                            })
                        }
                        else
                        {
                            Storage.set('validMode',0)
                            validMode = 0
                            User.sendSMS({
                                mobile:Verify.Phone,
                                smsType:1
                            })
                            .then(function(validCode)
                            {
                                console.log(validCode)
                                if(validCode.results==0)
                                {
                                    unablebutton()
                                    if(validCode.mesg.match("您的邀请码")=="您的邀请码")
                                    {
                                        $scope.logStatus="请稍后获取验证码";
                                    }
                                }
                                else
                                {
                                    $scope.logStatus="验证码发送失败！";
                                }
                            },function(err)
                            {
                                $scope.logStatus="验证码发送失败！";
                            })
                        }
                }
                else if(validMode==0&&succ.mesg=="User password isn't correct!")
                {
                    $scope.logStatus="您已经注册过了";
                }
                else if(validMode==1&&succ.mesg!="User password isn't correct!")
                {
                    $scope.logStatus="您还没有注册呢！";
                }
                else
                {
                    User.sendSMS({
                        mobile:Verify.Phone,
                        smsType:1
                    })
                    .then(function(validCode)
                    {
                        console.log(validCode)
                        if(validCode.results==0)
                        {
                            unablebutton()
                            if(validCode.mesg.match("您的邀请码")=="您的邀请码")
                            {
                                $scope.logStatus="请稍后获取验证码";
                            }
                        }
                        else
                        {
                            $scope.logStatus="验证码发送失败！";
                        }
                    },function(err)
                    {
                        $scope.logStatus="验证码发送失败！";
                    })
                }
            },function(err)
            {
                console.log(err)
                $scope.logStatus="网络错误！";
            })
        }
      }

    //判断验证码和手机号是否正确
    $scope.gotoReset = function(Verify){
        $scope.logStatus = '';
        if(Verify.Phone!="" && Verify.Code!="")
        {
            var tempVerify = 123;
            //结果分为三种：(手机号验证失败)1验证成功；2验证码错误；3连接超时，验证失败
            var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            //手机正则表达式验证
            if(phoneReg.test(Verify.Phone)){
                //测试用
                // if(Verify.Code==123456){
                //     $scope.logStatus = "验证成功";
                //     Storage.set('phoneNumber',Verify.Phone);
                //     if(validMode == 0){
                //         $timeout(function(){$state.go('agreement',{last:'register'});},500);
                //     }else{
                //        $timeout(function(){$state.go('setpassword')}); 
                //     }
                    
                // }else{$scope.logStatus = "验证码错误";}

                User.verifySMS({
                    mobile:Verify.Phone,
                    smsType:1,
                    smsCode:Verify.Code
                })
                .then(function(succ)
                {
                    console.log(succ)
                    if(succ.results==0)//验证成功
                    {
                        $scope.logStatus="验证成功！";
                        Storage.set('phoneNumber',Verify.Phone);
                        if (isregisted == true)
                        {
                          User.setOpenId({phoneNo:Verify.Phone,openId:Storage.get('openid')}).then(function(data){
                              if(data.msg == "success!")
                              {
                                $state.go('tab.home');
                              }
                          },function(){
                              $scope.logStatus = "连接超时！";
                          })
                        }
                        if(validMode == 0){
                            $timeout(function(){$state.go('agreement',{last:'register'});},500);
                        }else{
                            $timeout(function(){$state.go('setpassword')}); 
                        }
                    }
                    else //验证码错误
                    {
                        $scope.logStatus="请输入正确的验证码！";
                    }
                },
                function(err)
                {   
                    console.log(err)
                    $scope.logStatus="网络错误！";
                })
            }
            else{$scope.logStatus="手机号验证失败！";}        
            }       
        else{$scope.logStatus = "请输入完整信息！";}
        }

}])

//签署协议（0为签署）
.controller('AgreeCtrl', ['User','$stateParams','$scope','$timeout','$state','Storage','$ionicHistory','$http','Data', function(User,$stateParams,$scope, $timeout,$state,Storage,$ionicHistory,$http,Data) {
    $scope.YesIdo = function(){
        console.log('yesido');
        if($stateParams.last=='signin'){
            User.updateAgree({userId:Storage.get('UID'),agreement:"0"}).then(function(data){
                if(data.results!=null){
                    $timeout(function(){$state.go('tab.home');},500);
                }else{
                    console.log("用户不存在!");
                }
            },function(err){
                console.log(err);
            })
        }
        else if($stateParams.last=='register'){
            $timeout(function(){$state.go('setpassword',0)},500);
        }
    }
}])

//设置密码
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' ,'Storage','User',function($scope,$state,$rootScope,$timeout,Storage,User) {
    $scope.barwidth="width:0%";
    var validMode=Storage.get('validMode');//0->set;1->reset
    var phoneNumber=Storage.get('phoneNumber');
    $scope.headerText="设置密码";
    $scope.buttonText="";
    $scope.logStatus='';

    if(validMode==0)
        $scope.buttonText="下一步";
    else
        $scope.buttonText="完成";
    $scope.setPassword = function(password){
        if(password.newPass!=""&&password.confirm!="")
        {
            if(password.newPass==password.confirm)
            {
                if(password.newPass.length<6)//此处要验证密码格式，//先简单的
                {
                    $scope.logStatus='密码太短了！';
                }
                else
                {
                    if(validMode==0)
                    {
                        Storage.set('password',password.newPass);
                        $state.go('userdetail');
                    }
                    else
                    { 
                        User.changePassword({
                            phoneNo:phoneNumber,
                            password:password.newPass
                        })
                        .then(function(succ)
                        {
                            console.log(succ)
                            $state.go('signin')
                        },function(err)
                        {
                            console.log(err)
                        })
                    }
                }
            }
            else
           {
                $scope.logStatus='两次输入的密码不一致';
            }
        }
        else
        {
        $scope.logStatus='输入不正确!';
        }
    }
}])

//注册时填写医生个人信息
.controller('userdetailCtrl',['Doctor','$scope','$state','$ionicHistory','$timeout' ,'Storage', '$ionicPopup','$ionicLoading','$ionicPopover','User','$http',function(Doctor,$scope,$state,$ionicHistory,$timeout,Storage, $ionicPopup,$ionicLoading, $ionicPopover,User,$http){
    $scope.barwidth="width:0%";
    var phoneNumber=Storage.get('phoneNumber');
    var password=Storage.get('password');
    $scope.doctor={
        userId:"",
        name:"",
        workUnit:"",
        department:"",
        title:"",
        IDNo:"",
        major:"",
        description:""};

    $scope.infoSetup = function() 
    {
        User.register({
            'phoneNo':phoneNumber,
            'password':password,
            'role':'doctor'
        })
        .then(function(succ)
        {
            console.log(phoneNumber)
            console.log(password)
            //console.log(succ)
            Storage.set('UID',succ.userNo);

            //签署协议置位0，同意协议
            User.updateAgree({userId:Storage.get('UID'),agreement:"0"}).
            then(function(data){
                console.log(data);

            },function(err){
                console.log(err);
            })

            //填写个人信息
            $scope.doctor.userId = Storage.get('UID')
            Doctor.postDocBasic($scope.doctor)
            .then(
                function(data)
                {
                    console.log(data);
                    if (angular.isDefined(Storage.get('openid')) == true)
                    {
                      User.setOpenId({phoneNo:Verify.Phone,openId:Storage.get('openid')}).then(function(data){
                          if(data.msg == "success!")
                          {
                            $state.go('tab.home');
                          }
                      },function(){
                          $scope.logStatus = "连接超时！";
                      })
                    }
                    //$scope.doctor = data.newResults;                  
                },
                function(err)
                {
                    console.log(err)
                }
            );            

            //注册论坛

            $http({
                method  : 'POST',
                url     : 'http://121.43.107.106/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
                params    :{
                    'regsubmit':'yes',
                    'formhash':'',
                    'D2T9s9':phoneNumber,
                    'O9Wi2H':phoneNumber,
                    'hWhtcM':phoneNumber,
                    'qSMA7S':phoneNumber+'@qq.com'
                },  // pass in data as strings
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept':'application/xml, text/xml, */*'
                }  // set the headers so angular passing info as form data (not request payload)
            }).success(function(data) {
                // console.log(data);
            });
            $state.go('signin');
            Storage.set("lt",'bme319');

        },function(err)
        {
            console.log(err)       
        })      
    };
}])

//首页
.controller('homeCtrl', ['Communication','$scope','$state','$interval','$rootScope', 'Storage','$http','$sce',function(Communication,$scope, $state,$interval,$rootScope,Storage,$http,$sce) {
    $scope.barwidth="width:0%";
    $scope.navigation=$sce.trustAsResourceUrl("http://121.43.107.106/");

    ionic.DomUtil.ready(function(){
        $http({
            method  : 'POST',
            url     : 'http://121.43.107.106/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=$loginhash&mobile=2',
            params    : {'username':Storage.get('phoneNumber'),'password':Storage.get('phoneNumber')},  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
            }).success(function(data) {
                //console.log(data);
        });
    })
    $scope.options = {
        loop: false,
        effect: 'fade',
        speed: 500,
    }
    $scope.testregis=function()
    {
        // $http({
        //     method  : 'POST',
        //     url     : 'http://121.43.107.106/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
        //     params    :{
        //         'regsubmit':'yes',
        //         'formhash':'',
        //         'D2T9s9':'test9',
        //         'O9Wi2H':"123456",
        //         'hWhtcM':'123456',
        //         'qSMA7S':'qw@qq.com'
        //     },  // pass in data as strings
        //     headers : {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //         'Accept':'application/xml, text/xml, */*'
        //     }  // set the headers so angular passing info as form data (not request payload)
        // }).success(function(data) {
        //         // console.log(data);
        // });
    }
    // $scope.testRestful=function()
    // {
    //     Communication.removeMember({
    //              teamId:'teampost2',
    //              membersuserId:'id2'
    //          })
    //     .then(function(data){
    //         console.log(data)
    //     },function(err){
    //         console.log(err);
    //     })
    // }
}])

//咨询
.controller('consultCtrl', ['$scope','$state','$interval','$rootScope', 'Storage','QRScan','Counsel',  function($scope, $state,$interval,$rootScope,Storage,QRScan,Counsel) {
    $scope.barwidth="width:0%";
    //变量a 等待患者数量 变量b 已完成咨询患者数量
    $scope.doctor={a:0,b:0};
    var now=new Date();
    var year=now.getYear();
    var month=now.getMonth()+1;
    var day=now.getDate();
    var date1=month+"月"+day+"日";
    //var date1=new Date().format("MM月dd日");
    $scope.riqi=date1;

    //获取在等待
    Counsel.getCounsels({
        userId:Storage.get('UID'),
        status:0
    })
    .then(
        function(data)
        {
            console.log(data)
            Storage.set("consulted",angular.toJson(data.results))
            // console.log(angular.fromJson(Storage.get("consulted",data.results)))
            $scope.doctor.b=data.results.length;
        },
        function(err)
        {
            console.log(err)
        }
    )
    //获取进行中
    Counsel.getCounsels({
        userId:Storage.get('UID'),
        status:1
    })
    .then(
        function(data)
        {
            console.log(data)
            Storage.set("consulting",angular.toJson(data.results))
            // console.log(angular.fromJson(Storage.get("consulting",data.results)))
            $scope.doctor.a=data.results.length;
        },
        function(err)
        {
            console.log(err)
        }
    )
}])

//"咨询”进行中
.controller('doingCtrl', ['$scope','$state','$interval','$rootScope', 'Storage','$ionicPopover','Counsel','$ionicHistory',  function($scope, $state,$interval,$rootScope,Storage,$ionicPopover,Counsel,$ionicHistory) {
    $scope.patients=angular.fromJson(Storage.get("consulting"));
    console.log($scope.patients)
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
    scope: $scope
    }).then(function(popover) {
    $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
    $scope.popover.show($event);
    //$scope.testt=12345
    };
    $scope.goCounsel = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.consult');
    }
    
    $scope.query={
        name:''
    }
    $scope.clearSearch = function(){
        //console.log($scope.PatientSearch)
        $scope.query.name='';
    }

    $scope.itemClick = function(ele, userId) {
        if (ele.target.id == 'doingdetail'){
            console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'1',chatId:userId});
        }
    }
    //$scope.isChecked1=true;
}])

//"咨询”已完成
.controller('didCtrl', ['$scope','$state','$interval','$rootScope', 'Storage','$ionicPopover','$ionicHistory',  function($scope, $state,$interval,$rootScope,Storage,$ionicPopover,$ionicHistory) {
    $scope.patients=angular.fromJson(Storage.get("consulted"));
  
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
        //$scope.testt=12345
    };
    $scope.goCounsel = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.consult');
    }

    $scope.query={
        name:''
    }
    $scope.clearSearch = function(){
        //console.log($scope.PatientSearch)
        $scope.query.name='';
    }

    $scope.itemClick = function(ele, userId) {
        if (ele.target.id == 'diddetail'){
            console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'0',chatId:userId});
        }
    }
    //$scope.isChecked1=true;
}])


//"患者”页
.controller('patientCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage','$ionicPopover',  function(Doctor,$scope, $state,$interval,$rootScope,Storage,$ionicPopover) {
    $scope.barwidth="width:0%";
    var patients=[];
    //var patientlength = '';
    $scope.params={
        isPatients:true,
        updateTime:0
    }

    function load(force){
        var time= Date.now();
        if(!force && time-$scope.params.updateTime<21600000) return;
        $scope.params.updateTime=time;
        Doctor.getPatientList({
            userId:'doc01'
        })
        .then(
            function(data)
            {
                
                if (data.results!='')
                {
                    $scope.patients=data.results.patients;
                    //$scope.patients[1].patientId.VIP=0;
                }
                else
                {
                    $scope.patients=''
                }
                angular.forEach($scope.patients,
                    function(value,key)
                    {
                        $scope.patients[key].show=true;
                    }
                )            
            },
            function(err)
            {
                console.log(err)
            }
        );

        Doctor.getPatientByDate({
            userId:'doc01'
        })
        .then(
            function(data)
            {
                //console.log(data)
                $scope.Todays=data.results2;
                //console.log($scope.Todays)            
                // angular.forEach($scope.Todays,
                //     function(value,key)
                //     {
                //         $scope.Todays[key].show=true;
                //     }
                // )
            },
            function(err)
            {
                console.log(err)
            }
        );
    }

    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
    $scope.$on('$ionicView.enter', function() {
        load();
    })
    $scope.ShowPatients = function(){
        $scope.params.isPatients=true;
    }
    $scope.ShowTodays = function(){
        $scope.params.isPatients=false;
    }

    $scope.getPatientDetail = function(id) {
        console.log(id)
        Storage.set('getpatientId',id);
        $state.go('tab.patientDetail');
    }

    $scope.query={
        name:''
    }
    $scope.clearSearch = function(){
        //console.log($scope.PatientSearch)
        $scope.query.name='';
    }

    $ionicPopover.fromTemplateUrl('partials/others/sort_popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.filter={
        propertyName:'-patientId.VIP',
        choose:{
            isChecked1:true,
            isChecked2:true,
            isChecked3:true,
            isChecked4:true,
            isChecked5:true,
            isChecked6:true,
            isChecked7:true,
            isChecked8:true,
            isChecked9:false,
        }
    }
    $scope.filterShow=function () {
        angular.forEach($scope.patients,
            function(value,key)
            {
                $scope.patients[key].show=true;
                if(!$scope.filter.choose.isChecked7)
                {
                    if(value.patientId.gender==1)
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked8)
                {
                    if(value.patientId.gender==0)
                        $scope.patients[key].show=false;
                }
                if($scope.filter.choose.isChecked9)
                {
                    if(value.patientId.VIP==0)
                        $scope.patients[key].show=false;
                }
            }
        )
    }
}])

//"患者”详情子页
.controller('patientDetailCtrl', ['Insurance','Storage','Doctor','Patient','$scope','$ionicPopup','$ionicHistory','$state', function(Insurance,Storage,Doctor,Patient,$scope, $ionicPopup,$ionicHistory,$state) {
    $scope.hideTabs = true;

    // var patient = DoctorsInfo.searchdoc($stateParams.doctorId);
    // $scope.doctor = doc;
    $scope.goback=function(){
        $ionicHistory.goBack();
    }

    console.log(Storage.get('getpatientId'))
    Patient.getPatientDetail({
         userId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            console.log(data)
            if(data.results.diagnosisInfo.length>0)
                Storage.set("latestDiagnose",angular.toJson(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1]));
            $scope.patient=data.results;
            $scope.diagnosisInfo = data.results.diagnosisInfo;           
        },
        function(err)
        {
            console.log(err)
        }
    );

    Insurance.getInsMsg({
         doctorId:'doc01',
         patientId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            //console.log(data)
            $scope.Ins=data.results;       
        },
        function(err)
        {
            console.log(err)
        }
    );

    $scope.SendInsMsg=function()
    {
        Insurance.updateInsuranceMsg({
            doctorId:'doc01',
            patientId:Storage.get('getpatientId'),
            insuranceId:'ins01'
            //type:5  //保险type=5
        })
        .then(
            function(data)
            {
                //console.log(data)
                $scope.Ins.count=$scope.Ins.count + 1;
                //$state.go('tab.patientDetail');       
            },
            function(err)
            {
                console.log(err)
            }
        );
    }

    $scope.goToDiagnose=function()
    {
        $state.go("tab.DoctorDiagnose");
    }
    
  
}])


//"交流”页
.controller('communicationCtrl', ['$scope','$state','$interval','$rootScope', 'Storage',  function($scope, $state,$interval,$rootScope,Storage) {
  $scope.barwidth="width:0%";
  
}])

//"我”页
.controller('meCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage', 'wechat','$location','$ionicPopup','$ionicPopover',function(Doctor,$scope, $state,$interval,$rootScope,Storage,wechat,$location,$ionicPopup,$ionicPopover) {
  $scope.barwidth="width:0%";
   
    //$scope.userid=Storage.get('userid');
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.doRefresh();
    // });
    
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // console.log(data)
            $scope.doctor=data.results;
        },
        function(err)
        {
            console.log(err)
        }
    )

    //$scope.loadData(); 
    $scope.params = {
        // groupId:$state.params.groupId
        userId:Storage.get('UID')
    }

}])

//"我”二维码页
.controller('QRcodeCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage',  function(Doctor,$scope, $state,$interval,$rootScope,Storage) {
    //$scope.hideTabs = true;
    //$scope.userid=Storage.get('userid');
    // $scope.doctor=meFactory.GetDoctorInfo($scope.userid);
  

    //  $scope.qrscan= function(){
    //   QRScan.getCode({
    //   userId:'doc01'
    // })
    //   .then(function(data){
    //     console.log(data);
    //   },function(err){
    //     console.log(err);
    //   })
    // };

    $scope.params = {
        // groupId:$state.params.groupId
        userId:Storage.get('UID')
    }

    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // console.log(data)
            $scope.doctor=data.results;
        },
        function(err)
        {
            console.log(err)
        }
    );

}])


//"我”个人资料页
.controller('myinfoCtrl', ['Doctor','$scope','Storage', 'wechat','$location','$ionicPopup','$ionicPopover',function(Doctor,$scope, Storage,wechat,$location,$ionicPopup,$ionicPopover) {
    $scope.hideTabs = true;
    //$scope.userid=Storage.get('userid');
    //$scope.doctor=meFactory.GetDoctorInfo($scope.userid);
    $scope.updateDiv=false;
    $scope.myDiv=true;

    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
          // console.log(data)
            $scope.doctor=data.results;
        },
        function(err)
        {
            console.log(err)
        }
    )

    $scope.editinfo = function() {
        Doctor.editDoctorDetail($scope.doctor)
        .then(
            function(data)
            {
                console.log(data)
            },
            function(err)
            {
                console.log(err)
            }
        );
        $scope.myDiv = !$scope.myDiv;
        $scope.updateDiv = !$scope.updateDiv;
    };
  

    $scope.toggle = function() {
        $scope.myDiv = !$scope.myDiv;
        $scope.updateDiv = !$scope.updateDiv;   
    };
    
      // 上传头像的点击事件----------------------------
  $scope.onClickCamera = function($event){
    $scope.openPopover($event);
  };
  $scope.reload=function(){
    var t=$scope.doctor.photoUrl; 
    $scope.doctor.photoUrl=''

    $scope.$apply(function(){
      $scope.doctor.photoUrl=t;
    })

  }
 
 // 上传照片并将照片读入页面-------------------------
  var photo_upload_display = function(serverId){
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" +  "myAvatar.jpg";
    console.log(temp_photoaddress)
    var temp_name = 'resized' + Storage.get("UID") + "_" +  "myAvatar.jpg";
    wechat.download({serverId:serverId, name:temp_name})
    .then(function(res){
      //res.path_resized
      //图片路径
      $scope.doctor.photoUrl="http://121.43.107.106:8052/uploads/photos/"+temp_name+'?'+new Date().getTime();
      console.log($scope.doctor.photoUrl)
      // $state.reload("tab.mine")
      Doctor.editDoctorDetail({userId:Storage.get("UID"),photoUrl:$scope.doctor.photoUrl}).then(function(r){
        console.log(r);
      })
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

}])

//"我”个人收费页
.controller('myfeeCtrl', ['Doctor','$scope','$ionicPopup','$state','Storage' ,function(Doctor,$scope, $ionicPopup,$state,Storage) {
    $scope.hideTabs = true;
  
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
        // console.log(data)
            $scope.doctor=data.results;
        },
        function(err)
        {
            console.log(err)
        }
    )
  
    $scope.savefee = function() {
        Doctor.editDoctorDetail($scope.doctor)
        .then(
            function(data)
            {
                // console.log(data)
                // $scope.doctor=data.result;
            },
            function(err)
            {
                console.log(err)
            }
        )
        $state.go('tab.me');  
    };
  


  
}])


//"我”的评价
.controller('feedbackCtrl', ['Patient','Doctor','$scope','$ionicPopup','$state', 'Storage',function(Patient,Doctor,$scope, $ionicPopup,$state,Storage) {
    $scope.hideTabs = true;
    var commentlength='';
    //var commentlist=[];

    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // console.log(data)
            $scope.feedbacks=data.comments;
            $scope.doctor=data.results;
            //console.log($scope.feedbacks.length)
            commentlength=data.comments.length;
            //   for (var i=0; i<commentlength; i++){
            //       commentlist[i]=$scope.feedbacks[i].pateintId.userId;
        },
        function(err)
        {
            console.log(err)
        }
    );


    for (var i=0; i<commentlength; i++){
        Patient.getPatientDetail({
        userId:$scope.feedbacks[i].pateintId.userId
    })
        .then(
            function(data)
            {
            // console.log(data)
                $scope.feedbacks[i].photoUrl=data.results.photoUrl;
            },
            function(err)
            {
                console.log(err)
            }
        );
    }
   
    

}])


//"我”设置页
.controller('setCtrl', ['$scope','$ionicPopup','$state','$timeout','$stateParams', 'Storage',function($scope, $ionicPopup,$state,$timeout,$stateParams,Storage) {
    $scope.hideTabs = true; 
    $scope.logout = function() {
    //Storage.set('IsSignIn','NO');
    $state.logStatus="用户已注销";
    //清除登陆信息
    Storage.rm('IsSignIn');
    //Storage.rm('USERNAME');
    Storage.rm('PASSWORD');
    Storage.rm('userid');
    console.log($state);
    $timeout(function(){$state.go('signin');},500);
    };
  
}])


//"我”设置内容页
.controller('set-contentCtrl', ['$scope','$ionicPopup','$state','$stateParams','Storage','User', function($scope, $ionicPopup,$state,$stateParams,Storage,User) {
    $scope.hideTabs = true; 
    $scope.type = $stateParams.type;
    $scope.resetPassword=function(oldPW,newPW,confirmPW)
    {
        // console.log("resetpw")
        // console.log(oldPW)
        // console.log(newPW)
        // console.log(confirmPW)
        if(oldPW==undefined)
        {
            $scope.changePasswordStatus="请输入旧密码"
            return;
        }
        if(oldPW==newPW)
        {
            $scope.changePasswordStatus="不能重置为之前的密码"
            return;
        }
        if(newPW==undefined||newPW.length<6)
        {
            $scope.changePasswordStatus="新密码不能为空且必须大于6位"
            return;
        }
        if(newPW!=confirmPW)
        {
            $scope.changePasswordStatus="两次输入不一致"
            return;
        }
        User.logIn({username:Storage.get('USERNAME'),password:oldPW,role:'doctor'})
        .then(function(succ)
        {
            // console.log(Storage.get('USERNAME'))
            if(succ.results.mesg=="login success!")
            {
                User.changePassword({phoneNo:Storage.get('USERNAME'),password:newPW})
                .then(function(succ)
                {
                    // console.log(succ)
                    var phoneNo=Storage.get('USERNAME')
                    Storage.clear();
                    Storage.set('USERNAME',phoneNo)
                    $state.go('signin');
                },function(err)
                {
                    console.log(err)
                })
            }
            else
            { 
                $scope.changePasswordStatus="旧密码不正确"
            }
        },function(err)
        {
            console.log(err)
        })
    }
  
}])

//"我”排班页
.controller('schedualCtrl', ['$scope','ionicDatePicker','$ionicPopup','Doctor','Storage', function($scope,ionicDatePicker,$ionicPopup,Doctor,Storage) {
    var getSchedual=function()
    {
        Doctor.getSchedules({userId:Storage.get('UID')})
        .then(function(data)
        {
            // console.log(data)
            angular.forEach(data.results.schedules,function(value,key)
            {
                // console.log(value)
                var index=value.day-'0';
                if(value.time==1)
                    index+=7;
                $scope.workStatus[index].status=1;
                $scope.workStatus[index].style={'background-color':'red'};
            })
        },function(err)
        {
            console.log(err)
        })
        Doctor.getSuspendTime({userId:Storage.get('UID')})
        .then(function(data)
        {
            // console.log(data.results.suspendTime)
            if(data.results.suspendTime.length==0)
            {
                $scope.stausText="接诊中..."
                $scope.stausButtontText="停诊"
            }
            else
            {
                $scope.stausText="停诊中..."
                $scope.stausButtontText="接诊"
                $scope.begin=data.results.suspendTime[0].start;
                $scope.end=data.results.suspendTime[0].end;
            }
        },function(err)
        {
            console.log(err)
        })
    }
    $scope.workStatus=[
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
        {status:0,style:{'background-color':'white'}},
    ]
    $scope.stausButtontText="停诊"
    $scope.stausText="接诊中..."
    $scope.showSchedual=true;
    getSchedual();
    var ipObj1 = {
        callback: function (val) {  //Mandatory
            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            if($scope.flag==1)
            {
                $scope.begin=val;
                // console.log(1)
                // var date=new Date(val)
                // $scope.begin=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            }
            else
            {
                $scope.end=val;
                // console.log(2);
                // var date=new Date(val)
                // $scope.end=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            }
        },
        titleLabel: '停诊开始',
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
        $scope.flag=params;//标识选定时间用于开始时间还是结束时间
    };

    $scope.showSch=function()
    {
        if($scope.stausButtontText=="停诊")
        {
            $scope.showSchedual=false;
        }
        else
        {
            var param={
                userId:Storage.get('UID'),
                start:$scope.begin,
                end:$scope.end
            }
            // console.log(param)
            Doctor.deleteSuspendTime(param)
            .then(function(data)
            {
                console.log(data)
                $scope.stausButtontText="停诊"
                $scope.stausText="接诊中..."
            },function(err)
            {
                console.log(err)
            })
        }
    }
    $scope.stopWork=function(cancel)
    {
        if(cancel)
        {
            $scope.showSchedual=true;
            return;
        }
        if($scope.begin!=undefined&&$scope.end!=undefined)
        {
            var param={
                userId:Storage.get('UID'),
                start:$scope.begin,
                end:$scope.end
            }
            // console.log(param)
            Doctor.insertSuspendTime(param)
            .then(function(data)
            {
                console.log(data)
                $scope.stausButtontText="接诊"
                $scope.stausText="停诊中..."
                $scope.showSchedual=true;
            },function(err)
            {
                console.log(err)
            })
        }
    }
    $scope.changeWorkStatus=function(index)
    {
        // console.log("changeWorkStatus"+index)
        var text=''
        if($scope.workStatus[index].status==0)
        {
            text = '此时间段将更改为工作状态！'
        }
        else
        {
            text = '此时间段将更改为空闲状态！'
        }
        var confirmPopup = $ionicPopup.confirm({
            title: '修改工作状态',
            template: text,
            cancelText:'取消',
            okText:'确定'
        });

        confirmPopup.then(function(res) {
            if(res) {
                // console.log('You are sure');
                var param={
                    userId:Storage.get('UID'),
                    day:index.toString(),
                    time:'0'
                }
                if(index>6)
                {
                    param.time='1';
                    param.day=(index-7).toString();
                }
                // console.log(param)
                if($scope.workStatus[index].status==0)
                {
                    Doctor.insertSchedule(param)
                    .then(function(data)
                    {
                        // console.log(data)
                        $scope.workStatus[index].status=1;
                        $scope.workStatus[index].style={'background-color':'red'};
                    },function(err)
                    {
                        console.log(err)
                    })
                }
                else
                {
                    Doctor.deleteSchedule(param)
                    .then(function(data)
                    {
                        // console.log(data)
                        $scope.workStatus[index].status=0;
                        $scope.workStatus[index].style={'background-color':'white'};
                    },function(err)
                    {
                        console.log(err)
                    })
                }
            }
            else {
                // console.log('You are not sure');
            }
        });
    }

}])


