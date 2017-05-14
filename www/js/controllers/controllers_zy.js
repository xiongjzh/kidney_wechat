angular.module('zy.controllers', ['ionic','kidney.services'])

/////////////////////////////zhangying///////////////////////
//登录
.controller('SignInCtrl', ['User','$scope','$timeout','$state','Storage','loginFactory','$ionicHistory','jmapi', '$location','wechat','$window','$rootScope','Doctor','$sce',function(User,$scope, $timeout,$state,Storage,loginFactory,$ionicHistory,jmapi,$location,wechat,$window,$rootScope,Doctor,$sce) {
    $scope.barwidth="width:0%";
    $scope.navigation_login=$sce.trustAsResourceUrl("http://121.196.221.44:69/member.php?mod=logging&action=logout&formhash=xxxxxx");
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

                        jmapi.users(data.results.userId);
                        Doctor.getDoctorInfo({userId:data.results.userId})
                        .then(function(response){
                            thisDoctor = response.results;
                        },function(err){
                            thisDoctor=null;
                        }) 
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
.controller('phonevalidCtrl', ['$scope','$state','$interval', '$stateParams','Storage','User','$timeout', 'Doctor', function($scope, $state,$interval,$stateParams,Storage,User,$timeout,Doctor) {
    $scope.barwidth="width:0%";
    $scope.Verify={Phone:"",Code:""};
    $scope.veritext="获取验证码";
    $scope.isable=false;
    var tempuserId = "";
    var validMode=Storage.get('validMode');//0->set;1->reset
    var unablebutton = function(){      
     //验证码BUTTON效果
        $scope.isable=true;
        console.log($scope.isable)
        $scope.veritext="60S再次发送"; 
        var time = 59;
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
            Storage.set('RegisterNO',$scope.Verify.Phone)
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
                    User.getUserId({phoneNo:Verify.Phone}).then(function(data){
                        if(data.results == 0){
                            tempuserId = data.UserId
                            if(ata.roles.indexOf('doctor') == -1){
                                $scope.logStatus = "该手机号码没有医生权限,请确认手机号码或转移到肾事管家进行操作";
                                return;
                            }else {
                                $scope.logStatus = "该手机号码已经注册,请验证手机号绑定微信";
                                isregisted = true
                                User.sendSMS({
                                    mobile:Verify.Phone,
                                    smsType:2
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
                        else{
                            $scope.logStatus = "该用户不存在！请返回登录页面进行注册！"
                            return;
                        }
                        
                    },function(){
                        $scope.logStatus="连接超时！";
                    });
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
                        smsType:2
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
                    smsType:2,
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
                                console.log(tempuserId)
                                User.getAgree({userId:tempuserId}).then(function(res){
                                    if(res.results.agreement=="0"){
                                        $state.go('tab.home');
                                    }else{
                                        $state.go('agreement',{last:'signin'});
                                    }
                                },function(err){
                                    console.log(err);
                                })
                              }
                          },function(){
                              $scope.logStatus = "连接超时！";
                          })
                        }
                        else if(validMode == 0){
                            $state.go('agreement',{last:'register'});
                        }else{
                            $state.go('setpassword'); 
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
    var a=document.getElementById("agreement");
    // console.log(document.body.clientHeight);
    // console.log(window.screen.height);
    a.style.height=window.screen.height*0.65+"px";
}])

//设置密码
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' ,'Storage','User','jmapi',function($scope,$state,$rootScope,$timeout,Storage,User) {
    $scope.barwidth="width:0%";
    var validMode=Storage.get('validMode');//0->set;1->reset
    var phoneNumber=Storage.get('RegisterNO');
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
.controller('userdetailCtrl',['Dict','Doctor','$scope','$state','$ionicHistory','$timeout' ,'Storage', '$ionicPopup','$ionicLoading','$ionicPopover','User','$http',function(Dict,Doctor,$scope,$state,$ionicHistory,$timeout,Storage, $ionicPopup,$ionicLoading, $ionicPopover,User,$http){
    $scope.barwidth="width:0%";
    var phoneNumber=Storage.get('RegisterNO');
    var password=Storage.get('password');
    $scope.Titles =
    [
        {Name:"主任医师",Type:1},
        {Name:"副主任医师",Type:2},
        {Name:"主治医师",Type:3},
        {Name:"住院医师",Type:4},
        {Name:"主任护师",Type:5},
        {Name:"副主任护师",Type:6},
        {Name:"主管护师",Type:7},
        {Name:"护师",Type:8},
        {Name:"护士",Type:9}
    ]
    $scope.doctor={
        userId:"",
        name:"",
        workUnit:"",
        department:"",
        title:"",
        IDNo:"",
        major:"",
        description:""};

    //------------省市医院读字典表---------------------
    Dict.getDistrict({level:"1",province:"",city:"",district:""})
    .then(
        function(data)
        {
            $scope.Provinces = data.results;
            // $scope.Province.province = "";
            console.log($scope.Provinces)
        },
        function(err)
        {
            console.log(err);
        }
    )    

    $scope.getCity = function (pro) {
        console.log(pro)
        if(pro!=null){
            Dict.getDistrict({level:"2",province:pro,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    console.log($scope.Cities);            
                },
                function(err)
                {
                    console.log(err);
                }
            );
        }else{
            $scope.Cities = {};
            $scope.Hospitals = {};
        }
    }

    $scope.getHospital = function (city) {
            console.log(city)
        if(city!=null){
            //var locationCode = district.province + district.city + district.district
            //console.log(locationCode)

            Dict.getHospital({city:city})
            .then(
                function(data)
                {
                    $scope.Hospitals = data.results;
                    console.log($scope.Hospitals);
                },
                function(err)
                {
                    console.log(err);
                }
            )
        }else{
            $scope.Hospitals = {};
        }
    }
    $scope.test = function(docinfo){
        console.log(docinfo)
        $scope.doctor.province = docinfo.province;
        $scope.doctor.city = docinfo.city;
        $scope.doctor.workUnit = docinfo.hospitalName;        
    }
    //------------省市医院读字典表---------------------

    $scope.infoSetup = function() 
    {
        if ($scope.doctor.name&&$scope.doctor.province&&$scope.doctor.city&&$scope.doctor.workUnit&&$scope.doctor.department&&$scope.doctor.title&&$scope.doctor.IDNo){
            //如果必填信息已填
            var IDreg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  //身份证号判断
            if ($scope.doctor.IDNo!='' && IDreg.test($scope.doctor.IDNo) == false){
                // console.log("身份证");
                $ionicLoading.show({
                    template: '请输入正确的身份证号',
                    duration:1000
                });
            }
            else{
                $scope.doctor.title = $scope.doctor.title.Name
                User.register({
                    'phoneNo':phoneNumber,
                    'password':password,
                    'role':'doctor'
                })
                .then(function(succ)
                {
                    console.log(phoneNumber)
                    console.log(password)
                    console.log(succ)
                    Storage.set('UID',succ.userNo);

                    //签署协议置位0，同意协议
                    User.updateAgree({userId:Storage.get('UID'),agreement:"0"})
                    .then(function(data){
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
                            jmapi.users(Storage.get('UID'));
                            console.log(data);
                            console.log($scope.doctor)
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
                        url     : 'http://121.196.221.44:69/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1',
                        params    :{
                            'regsubmit':'yes',
                            'formhash':'',
                            'username':$scope.doctor.name+phoneNumber.slice(7),
                            'password':$scope.doctor.name+phoneNumber.slice(7),
                            'password2':$scope.doctor.name+phoneNumber.slice(7),
                            'email':phoneNumber+'@bme319.com'
                        },  // pass in data as strings
                        headers : {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept':'application/xml, text/xml, */*'
                        }  // set the headers so angular passing info as form data (not request payload)
                    }).success(function(data) {
                        // console.log(data);
                    });
                    if (Storage.get('openid') == null)
                    {
                        $state.go('signin');
                        Storage.set("lt",'bme319');
                    }
                    else
                    {
                        User.setOpenId({phoneNo:phoneNumber,openId:Storage.get('openid')})
                        .then(
                            function(data)
                            {
                                if(data.msg == "success!")
                                {
                                    $state.go('tab.home');
                                }            
                            },
                            function(err)
                            {
                                console.log(err)
                            }
                        ); 
                    }
                    

                },function(err)
                {
                    console.log(err)       
                })                 
            }                         
        }
        else{
            $ionicLoading.show({
                template: '信息填写不完整,请完善必填信息(红色*)',
                duration:1000
            });            
        }
    
    };

}])

//首页
.controller('homeCtrl', ['Communication','$scope','$state','$interval','$rootScope', 'Storage','$http','$sce','$timeout','Doctor','New',function(Communication,$scope, $state,$interval,$rootScope,Storage,$http,$sce,$timeout,Doctor,New) {
    $scope.barwidth="width:0%";
    console.log(Storage.get('USERNAME'));    
    $scope.hasUnreadMessages = false;
    var RefreshUnread;
    var GetUnread = function(){
        New.getNewsByReadOrNot({userId:Storage.get('UID'),readOrNot:0}).then(//
            function(data){
                if(data.results.length){
                    $scope.HasUnreadMessages = true;
                    // console.log($scope.HasUnreadMessages);
                }
            },function(err){
                    console.log(err);
            });
    }
    GetUnread();
    RefreshUnread = $interval(GetUnread,2000);
    $scope.isWriting={'margin-top': '100px'};
    if(!sessionStorage.addKBEvent)
    {
        // console.log("true")
        sessionStorage.addKBEvent=true;
        window.addEventListener('native.keyboardshow', keyboardShowHandler);
        window.addEventListener('native.keyboardhide', keyboardHideHandler);
    }
    function keyboardShowHandler(e){
        $scope.$apply(function(){
            $scope.isWriting={'margin-top': '-40px','z-index':'20'};
        })
    }
    function keyboardHideHandler(e){
        $scope.$apply(function(){
            $scope.isWriting={'margin-top': '100px'};
        })
    }
    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            console.log(data)
            $scope.navigation_login=$sce.trustAsResourceUrl("http://121.196.221.44:69/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=$loginhash&mobile=2&username="+data.results.name+Storage.get('USERNAME').slice(7)+"&password="+data.results.name+Storage.get('USERNAME').slice(7));
            $scope.navigation=$sce.trustAsResourceUrl("http://121.196.221.44:69/");
        },
        function(err)
        {
            console.log(err)
        }
    )
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
    var forumReg=function(phone,role)
    {
        // console.log(phone.userName+phone.phoneNo.slice(7))
        var un=phone.userName+phone.phoneNo.slice(7);
        var url='http://121.43.107.106';
        if(role=='patient')
            url+=':6699/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1'
        else if(role=='doctor')
            url+='/member.php?mod=register&mobile=2&handlekey=registerform&inajax=1';
        $http({
            method  : 'POST',
            url     : url,
            params    :{
                'regsubmit':'yes',
                'formhash':'xxxxxx',
                'username':un,
                'password':un,
                'password2':un,
                'email':phone.phoneNo+'@bme319.com'
            },  // pass in data as strings
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept':'application/xml, text/xml, */*'
            }  // set the headers so angular passing info as form data (not request payload)
        }).success(function(s){
            console.log(s)
        })
    }
    $scope.importDocs=function()
    {
        $http({
            method:'GET',
            url:'http://121.196.221.44:4050/user/getPhoneNoByRole?role=patient'
        })
        .success(function(data)
        {
            console.log(data)
            var users=data.results;
            for(var i=0;i<users.length;i++)
            {
                forumReg(users[i],'patient');
            }
        })
        $http({
            method:'GET',
            url:'http://121.196.221.44:4050/user/getPhoneNoByRole?role=doctor'
        })
        .success(function(data)
        {
            console.log(data)
            var users=data.results;
            for(var i=0;i<users.length;i++)
            {
                forumReg(users[i],'doctor');
            }
        })
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
    var load = function()
    {
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
    }
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }    
    // $scope.$on('$ionicView.beforeEnter', function() {
    //     $scope.params.isPatients = '1';
    // })
    $scope.$on('$ionicView.enter', function() {
        load();
    })
}])

//"咨询”进行中
.controller('doingCtrl', ['$scope','$state','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover','Counsel','$ionicHistory','New',  function($scope, $state,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover,Counsel,$ionicHistory,New) {
    $scope.$on('$ionicView.beforeEnter',function(){
        Counsel.getCounsels({userId:Storage.get('UID'), status:1 })
        .then(function(data){
            $scope.allpatients=data.results;
            New.addNestNews('11',Storage.get('UID'),$scope.allpatients,'userId','patientId')
            .then(function(pats){
                $scope.patients=pats;
            })
            // $scope.patients=data.results;
        })
    })
    // $scope.allpatients=angular.fromJson(Storage.get("consulting"));
    // $scope.patients=$scope.allpatients;
    // console.log($scope.allpatients)
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    
    $scope.goSearch = function() {
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:1,
            name:$scope.search.name
        })
        .then(function(data) {
            $scope.patients = data.results
            if (data.results.length == 0) {
                //console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    $scope.clearSearch = function() {
        $scope.search.name = '';
        $scope.patients = $scope.allpatients;
        $scope.search.name = '';
    }
    //----------------结束搜索患者------------------
    $ionicPopover.fromTemplateUrl('partials/others/sort_popover_consult.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
        //$scope.testt=12345
    };
    $scope.filters={
        item1:true,
        item2:true
    }
    $scope.filterShow=function()
    {
        angular.forEach($scope.patients,function(value,key)
        {
            value.show=true;
            if(!$scope.filters.item1)
            {
                if(value.type==1)
                    value.show=false;
            }
            if(!$scope.filters.item2)
            {
                if(value.type==2||value.type==3)
                    value.show=false;
            }
        })
        // console.log($scope.patients)
    }

    $scope.goCounsel = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.consult');
    }

    $scope.itemClick = function(ele, userId, counselId) {
        if (ele.target.id == 'doingdetail'){
            // console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'1',chatId:userId,counselId:counselId});
        }
    }
}])

//"咨询”已完成
.controller('didCtrl', ['$scope','$state','Counsel','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover','$ionicHistory','New',  function($scope, $state,Counsel,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover,$ionicHistory,New) {
    $scope.$on('$ionicView.beforeEnter',function(){
        Counsel.getCounsels({userId:Storage.get('UID'), status:0 })
        .then(function(data){
            $scope.allpatients=data.results;
            New.addNestNews('11',Storage.get('UID'),$scope.allpatients,'userId','patientId')
            .then(function(pats){
                $scope.patients=pats;
            })

            // $scope.patients=data.results;
        })
    })
    // $scope.allpatients=angular.fromJson(Storage.get("consulted"));
    // $scope.patients=$scope.allpatients;
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    $scope.goSearch = function() {
        Counsel.getCounsels({
            userId:Storage.get('UID'),
            status:0,
            name:$scope.search.name
        })
        .then(function(data) {
            $scope.patients = data.results
            if (data.results.length == 0) {
                //console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    $scope.clearSearch = function() {
        $scope.search.name = '';
        $scope.patients = $scope.allpatients;
        $scope.search.name = '';
    }
    //----------------结束搜索患者------------------      
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
    $scope.filters={
        item1:true,
        item2:true
    }
    $scope.filterShow=function()
    {
        angular.forEach($scope.patients,function(value,key)
        {
            value.show=true;
            if(!$scope.filters.item1)
            {
                if(value.type==1)
                    value.show=false;
            }
            if(!$scope.filters.item2)
            {
                if(value.type==2||value.type==3)
                    value.show=false;
            }
        })
        // console.log($scope.patients)
    }

    $scope.itemClick = function(ele, userId, counselId) {
        if (ele.target.id == 'diddetail'){
            console.log(userId)
            Storage.set('getpatientId',userId);
            $state.go('tab.patientDetail');
        }else
        {
            // Storage.set('getpatientId',userId);
            //[type]:0=已结束;1=进行中;2=医生
            $state.go('tab.detail',{type:'0',chatId:userId,counselId:counselId});
        }
    }
    //$scope.isChecked1=true;
}])


//"患者”页
.controller('patientCtrl', ['Doctor','$scope','$state','$ionicLoading','$interval','$rootScope', 'Storage','$ionicPopover',  function(Doctor,$scope, $state,$ionicLoading,$interval,$rootScope,Storage,$ionicPopover) {
    $scope.barwidth="width:0%";
    var patients=[];

    $scope.params={
        isPatients:true,
        updateTime:0
    }

    var load = function()
    {
        Doctor.getPatientList({
            userId:Storage.get('UID')
        })
        .then(

            function(data)
            {
                console.log(data)
                if (data.results!='')
                {
                    $scope.allpatients=data.results.patients;
                    $scope.patients=$scope.allpatients;
                    // $scope.patients=$scope.allpatients;
                    //$scope.patients[1].patientId.VIP=0;
                    // $scope.patients.push(
                    //     {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
                    //     {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
                    //     {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
                    // console.log($scope.patients)
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
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                //console.log(data)
                $scope.Todays=data.results2;
                // $scope.Todays.push(
                //         {show:true,patientId:{IDNo:"330183199210315001",gender:1,class:"class_1",VIP:0,name:'static_01',birthday:"2017-04-18T00:00:00.000Z"}},
                //         {show:false,patientId:{IDNo:"330183199210315002",gender:0,class:"class_2",VIP:1,name:'static_02',birthday:"2016-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315003",gender:1,class:"class_3",VIP:1,name:'static_03',birthday:"2015-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315004",gender:0,class:"class_4",VIP:0,name:'static_04',birthday:"2014-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315005",gender:1,class:"class_5",VIP:1,name:'static_05',birthday:"2013-04-18T00:00:00.000Z"}},
                //         {show:true,patientId:{IDNo:"330183199210315006",gender:0,class:"class_6",VIP:1,name:'static_06',birthday:"2012-04-18T00:00:00.000Z"}})
                //console.log($scope.Todays)            
                angular.forEach($scope.Todays,
                    function(value,key)
                    {
                        $scope.Todays[key].show=true;
                    }
                )
            },
            function(err)
            {
                console.log(err)
            }
        );
    }
    //----------------开始搜索患者------------------
    $scope.search={
        name:''
    }
    $scope.goSearch = function() {
        Doctor.getPatientList({ 
            userId:Storage.get('UID'),
            name: $scope.search.name 
        })
        .then(function(data) {
            //$scope.params.isPatients=true;
            //console.log(data.results)
            $scope.patients = data.results.patients;
            //console.log($scope.patients[0].patientId.name)
            if (data.results.patients.length == 0) {
                console.log("aaa")
                $ionicLoading.show({ template: '查无此人', duration: 1000 })
            }
        }, function(err) {
            console.log(err);
        })
    }

    $scope.clearSearch = function() {
        $scope.search.name = '';
        $scope.patients = $scope.allpatients;
        $scope.search.name = '';
    }
    //----------------结束搜索患者------------------
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
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
    var filterReset=angular.copy($scope.filter);
    $scope.resetFilter=function()
    {
        // console.log("reset")
        $scope.filter=angular.copy(filterReset);
        $scope.filterShow();
    }
    $scope.filterShow=function () {
        angular.forEach($scope.patients,
            function(value,key)
            {
                $scope.patients[key].show=true;
                if(!$scope.filter.choose.isChecked1)
                {
                    if(value.patientId.class=='class_1')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked2)
                {
                    if(value.patientId.class=='class_5')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked3)
                {
                    if(value.patientId.class=='class_6')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked4)
                {
                    if(value.patientId.class=='class_2')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked5)
                {
                    if(value.patientId.class=='class_3')
                        $scope.patients[key].show=false;
                }
                if(!$scope.filter.choose.isChecked6)
                {
                    if(value.patientId.class=='class_4')
                        $scope.patients[key].show=false;
                }
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
        angular.forEach($scope.Todays,
            function(value,key)
            {
                $scope.Todays[key].show=true;
                if(!$scope.filter.choose.isChecked1)
                {
                    if(value.patientId.class=='class_1')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked2)
                {
                    if(value.patientId.class=='class_5')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked3)
                {
                    if(value.patientId.class=='class_6')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked4)
                {
                    if(value.patientId.class=='class_2')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked5)
                {
                    if(value.patientId.class=='class_3')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked6)
                {
                    if(value.patientId.class=='class_4')
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked7)
                {
                    if(value.patientId.gender==1)
                        $scope.Todays[key].show=false;
                }
                if(!$scope.filter.choose.isChecked8)
                {
                    if(value.patientId.gender==0)
                        $scope.Todays[key].show=false;
                }
                if($scope.filter.choose.isChecked9)
                {
                    if(value.patientId.VIP==0)
                        $scope.Todays[key].show=false;
                }
            }
        )
    }
}])

//"患者”详情子页
.controller('patientDetailCtrl', ['Insurance','Storage','Doctor','Patient','$scope','$ionicPopup','$ionicHistory','$state', 'New',function(Insurance,Storage,Doctor,Patient,$scope, $ionicPopup,$ionicHistory,$state,New) {
    $scope.hideTabs = true;

    // var patient = DoctorsInfo.searchdoc($stateParams.doctorId);
    // $scope.doctor = doc;
    $scope.backview=$ionicHistory.viewHistory().backView
        $scope.backstateId=null;
        if($scope.backview!=null){
            $scope.backstateId=$scope.backview.stateId
            //console.log($scope.backstateId)
            if($scope.backstateId=="tab.doing"){
                Storage.set('backId',$scope.backstateId);
            }else if($scope.backstateId=="tab.did"){
                Storage.set('backId',$scope.backstateId);
            }else if($scope.backstateId=="tab.patient"){
                Storage.set('backId',$scope.backstateId)
                //console.log(Storage.get('backId'))
            }            
        }
        console.log(Storage.get('backId'))
        $scope.goback = function() {           
            var backId = Storage.get('backId')
            console.log(backId)
            if(backId=="tab.doing"){
              $state.go("tab.doing")
            }
            else if(backId=="tab.did"){
                $state.go('tab.did');
            }else{
              $state.go('tab.patient');
            }
        }
    $scope.gototestrecord=function(){
        $state.go('tab.TestRecord',{PatinetId:Storage.get('getpatientId')});
    }
    // console.log(Storage.get('getpatientId'))
    Patient.getPatientDetail({
         userId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            // console.log(data)
            Storage.set("latestDiagnose","");
            if(data.results.diagnosisInfo.length>0)
            {
                Storage.set("latestDiagnose",angular.toJson(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1]));
                // console.log(data.results.diagnosisInfo[data.results.diagnosisInfo.length-1])
            }
            else if(data.results.diagnosisInfo.length==0)
            {
                var lD={
                    content:"",
                    hypertension:data.results.hypertension,
                    name:data.results.class,
                    operationTime:data.results.operationTime,
                    progress:data.results.class_info?data.results.class_info[0]:"",
                    time:""
                }
                Storage.set("latestDiagnose",angular.toJson(lD));
            }
            $scope.patient=data.results;
            $scope.diagnosisInfo = data.results.diagnosisInfo;           
        },
        function(err)
        {
            console.log(err)
        }
    );

    Insurance.getInsMsg({
        doctorId:Storage.get('UID'),
        patientId:Storage.get('getpatientId')
    })
    .then(
        function(data)
        {
            // console.log(data.results)
            $scope.Ins=data.results||{count:0};                   
        },
        function(err)
        {
            console.log(err)
        }
    );

    $scope.SendInsMsg=function()
    {
        Insurance.updateInsuranceMsg({
            doctorId:Storage.get('UID'),
            patientId:Storage.get('getpatientId'),
            insuranceId:'ins01',
            description:'医生给您发送了一条保险消息'
            //type:5  //保险type=5
        })
        .then(
            function(data)
            {
                //console.log(data)
                $scope.Ins.count=$scope.Ins.count + 1;
                console.log(data)
                Storage.set('MessId',data.newResults.message.messageId)
                New.insertNews({
                    sendBy:Storage.get('UID'),
                    userId:Storage.get('getpatientId'),
                    type:5,
                    readOrNot:'0',
                    description:'医生给您发送了一条保险消息',
                    messageId:Storage.get('MessId')                    
                })
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
.controller('meCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage', 'wechat','$location','$ionicPopup','$ionicPopover','$ionicLoading','$timeout',function(Doctor,$scope, $state,$interval,$rootScope,Storage,wechat,$location,$ionicPopup,$ionicPopover,$ionicLoading,$timeout) {
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
        $ionicLoading.show({
            template:'头像更新中',
            duration:5000
        })
       // 给照片的名字加上时间戳
        var temp_photoaddress = Storage.get("UID") + "_" +  "myAvatar.jpg";
        console.log(temp_photoaddress)
        var temp_name = 'resized' + Storage.get("UID") + "_" +  "myAvatar.jpg";
        wechat.download({serverId:serverId, name:temp_name})
        .then(function(res){
          //res.path_resized
          //图片路径
          $timeout(function(){
              $ionicLoading.hide();
              $scope.doctor.photoUrl="http://121.196.221.44:8052/uploads/photos/"+temp_name+'?'+new Date().getTime();
              
              console.log($scope.doctor.photoUrl)
              // $state.reload("tab.mine")
              Doctor.editDoctorDetail({userId:Storage.get("UID"),photoUrl:$scope.doctor.photoUrl}).then(function(r){
                console.log(r);
              })
          },1000)
          
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
        var path = "http://doctor.haihonghospitalmanagement.com/?code=" + Storage.get('code');
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
      var path = "http://doctor.haihonghospitalmanagement.com/?code=" + Storage.get('code');
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

}])

//"我”二维码页
.controller('QRcodeCtrl', ['Doctor','$scope','$state','$interval','$rootScope', 'Storage',  function(Doctor,$scope, $state,$interval,$rootScope,Storage) {
    //$scope.hideTabs = true;
    //$scope.userid=Storage.get('userid');
    // $scope.doctor=meFactory.GetDoctorInfo($scope.userid);
  

    //  $scope.qrscan= function(){
    //   QRScan.getCode({
    //   userId:Storage.get('UID')
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
.controller('myinfoCtrl', ['Doctor','$scope','Storage', 'wechat','$location','$ionicPopup','$ionicPopover','$ionicLoading','Dict','$timeout',function(Doctor,$scope, Storage,wechat,$location,$ionicPopup,$ionicPopover,$ionicLoading,Dict,$timeout) {
    $scope.hideTabs = true;
    $scope.updateDiv=false;
    $scope.myDiv=true;

    $scope.ProvinceObject={};
    $scope.CityObject={};
    $scope.HosObject={};

    $scope.Titles =
    [
        {Name:"主任医师",Type:1},
        {Name:"副主任医师",Type:2},
        {Name:"主治医师",Type:3},
        {Name:"住院医师",Type:4},
        {Name:"主任护师",Type:5},
        {Name:"副主任护师",Type:6},
        {Name:"主管护师",Type:7},
        {Name:"护师",Type:8},
        {Name:"护士",Type:9}
    ]

    Doctor.getDoctorInfo({
        userId:Storage.get('UID')
    })
    .then(
        function(data)
        {
            // console.log(data)
            $scope.doctor=data.results;
            // if(data.results.photoUrl==undefined||data.results.photoUrl==""){
            //   $scope.doctor.photoUrl="img/doctor.png"
            // }else{
            //   $scope.doctor.photoUrl=data.results.photoUrl;
            // }
            // if ($scope.doctor.province != null){
            //     $scope.doctor.province = searchObj($scope.doctor.province,$scope.Provinces)
            // }
            // if ($scope.doctor.city != null){
            //     $scope.doctor.city = searchObj($scope.doctor.city,$scope.Cities)
            // }
            // if ($scope.doctor.workUnit != null){
            //     $scope.doctor.workUnit = searchObj($scope.doctor.workUnit,$scope.Hospitals)
            // }
        },
        function(err)
        {
            console.log(err)
        }
    )


    $scope.editinfo = function() {
        // $scope.ProvinceObject = $scope.doctor.province;
        // console.log("123"+$scope.ProvinceObject);
        $scope.doctor.title = $scope.doctor.title.Name
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
        //$scope.ProvinceObject = $scope.doctor.province;
        //console.log($scope.ProvinceObject);
        var searchObj = function(code,array){
            if(array && array.length){
                for (var i = 0; i < array.length; i++) {
                    if(array[i].name == code || array[i].hospitalName == code|| array[i].Name == code) return array[i];
                };
            }
            return "未填写";           
        } 
        //读职称
        if ($scope.doctor.title != null){
            console.log($scope.doctor.title)
            console.log($scope.Titles)
            $scope.doctor.title = searchObj($scope.doctor.title,$scope.Titles)
        }   
        //-------------点击编辑省市医院读字典表--------------
        if ($scope.doctor.province != null){
            //console.log($scope.doctor.province)
            //console.log($scope.Provinces)
            $scope.ProvinceObject = searchObj($scope.doctor.province,$scope.Provinces)

        }
        if ($scope.doctor.city != null){
            //console.log($scope.ProvinceObject.province)
            Dict.getDistrict({level:"2",province:$scope.ProvinceObject.province,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    //console.log($scope.Cities);
                    $scope.CityObject = searchObj($scope.doctor.city,$scope.Cities)
                    console.log($scope.CityObject)
                    console.log($scope.CityObject.name)
                    if ($scope.doctor.workUnit != null){
                        //console.log($scope.Hospitals)
                        console.log($scope.doctor.workUnit)
                        console.log($scope.CityObject)
                        console.log($scope.CityObject.name)
                        Dict.getHospital({city:$scope.CityObject.name})
                        .then(
                            function(data)
                            {
                                $scope.Hospitals = data.results;
                                //console.log($scope.Hospitals);
                                $scope.HosObject = searchObj($scope.doctor.workUnit,$scope.Hospitals)
                            },
                            function(err)
                            {
                                console.log(err);
                            }
                        )                   
                    }
                },
                function(err)
                {
                    console.log(err);
                }
            );                       
        }
        //-------------点击编辑省市医院读字典表--------------

    };

    //--------------省市医院读字典表---------------------
    Dict.getDistrict({level:"1",province:"",city:"",district:""})
    .then(
        function(data)
        {
            $scope.Provinces = data.results;
            //$scope.Province.province = "";
            //console.log($scope.Provinces)
        },
        function(err)
        {
            console.log(err);
        }
    )    

    $scope.getCity = function (pro) {
        console.log(pro)
        if(pro!=null){
            Dict.getDistrict({level:"2",province:pro,city:"",district:""})
            .then(
                function(data)
                {
                    $scope.Cities = data.results;
                    console.log($scope.Cities);            
                },
                function(err)
                {
                    console.log(err);
                }
            );
        }else{
            $scope.Cities = {};
            $scope.Hospitals = {};
        }
    }

    $scope.getHospital = function (city) {
            console.log(city)
        if(city!=null){
            //var locationCode = district.province + district.city + district.district
            //console.log(locationCode)

            Dict.getHospital({city:city})
            .then(
                function(data)
                {
                    $scope.Hospitals = data.results;
                    console.log($scope.Hospitals);
                },
                function(err)
                {
                    console.log(err);
                }
            )
        }else{
            $scope.Hospitals = {};
        }
    }

    $scope.trans = function(docinfo){
        console.log(docinfo)
        if (docinfo !=null)
        {
            $scope.doctor.province = docinfo.province;
            $scope.doctor.city = docinfo.city;
            $scope.doctor.workUnit = docinfo.hospitalName;    
        }
      
    }
    //------------省市医院读字典表--------------------
    
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
    $ionicLoading.show({
        template:'头像更新中',
        duration:5000
    })
   // 给照片的名字加上时间戳
    var temp_photoaddress = Storage.get("UID") + "_" +  "myAvatar.jpg";
    console.log(temp_photoaddress)
    var temp_name = 'resized' + Storage.get("UID") + "_" +  "myAvatar.jpg";
    wechat.download({serverId:serverId, name:temp_name})
    .then(function(res){
      //res.path_resized
      //图片路径
      $timeout(function(){
          $ionicLoading.hide();
          $scope.doctor.photoUrl="http://121.196.221.44:8052/uploads/photos/"+temp_name+'?'+new Date().getTime();
          
          console.log($scope.doctor.photoUrl)
          // $state.reload("tab.mine")
          Doctor.editDoctorDetail({userId:Storage.get("UID"),photoUrl:$scope.doctor.photoUrl}).then(function(r){
            console.log(r);
          })
      },1000)
      
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
    var path = "http://doctor.haihonghospitalmanagement.com/?code=" + Storage.get('code');
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
      var path = "http://doctor.haihonghospitalmanagement.com/?code=" + Storage.get('code');
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

}])

//"我”个人收费页
.controller('myfeeCtrl', ['Account','Doctor','$scope','$ionicPopup','$state','Storage' ,function(Account,Doctor,$scope, $ionicPopup,$state,Storage) {
    $scope.hideTabs = true;
    var load = function(){
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

        Account.getAccountInfo({
            userId:Storage.get('UID')
        })
        .then(
            function(data)
            {
                //console.log(data)
                //console.log(data.results[0].money)
                $scope.account={money:data.results.length==0?0:data.results[0].money};
                // if (data.results.length!=0)
                // {
                //     $scope.account=data.results
                // }
                // else
                // {
                //     $scope.account={money:0}
                // }
            },
            function(err)
            {
                console.log(err)
            }
        )        
    }
    $scope.$on('$ionicView.enter', function() {
        load();
    })
    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }   

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
    var load = function(){
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
                //commentlength=data.comments.length;
                //   for (var i=0; i<commentlength; i++){
                //       commentlist[i]=$scope.feedbacks[i].pateintId.userId;
            },
            function(err)
            {
                console.log(err)
            }
        );

        // for (var i=0; i<commentlength; i++){
        //     Patient.getPatientDetail({
        //     userId:$scope.feedbacks[i].pateintId.userId
        // })
        //     .then(
        //         function(data)
        //         {
        //         // console.log(data)
        //             $scope.feedbacks[i].photoUrl=data.results.photoUrl;
        //         },
        //         function(err)
        //         {
        //             console.log(err)
        //         }
        //     );
        // }
    }
    $scope.$on('$ionicView.enter', function() {
        load();
    })

    $scope.doRefresh = function(){
        load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }

}])


//"我”设置页
.controller('setCtrl', ['$scope','$ionicPopup','$state','$timeout','$stateParams', 'Storage','$sce',function($scope, $ionicPopup,$state,$timeout,$stateParams,Storage,$sce) {
    $scope.hideTabs = true; 
    $scope.logout = function() {
    //Storage.set('IsSignIn','NO');
    $state.logStatus="用户已注销";
    //清除登陆信息
    Storage.rm('IsSignIn');
    //Storage.rm('USERNAME');
    Storage.rm('PASSWORD');
    Storage.rm('userid');
    $scope.navigation_login=$sce.trustAsResourceUrl("http://121.196.221.44:69/member.php?mod=logging&action=logout&formhash=xxxxxx");
    console.log($state);
    $timeout(function(){$state.go('signin');},500);
    };
  
}])


//"我”设置内容修改密码页
.controller('set-contentCtrl', ['$timeout','$scope','$ionicPopup','$state','$stateParams','Storage','User', function($timeout,$scope, $ionicPopup,$state,$stateParams,Storage,User) {
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
                    //Storage.clear();
                    Storage.set('USERNAME',phoneNo)
                    $scope.changePasswordStatus = "修改成功！";
                    //$state.go('signin');
                    $timeout(function(){$state.go('tab.set');},500);
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
//“我”设置内容查看协议页
.controller('viewAgreeCtrl', ['$scope','$state','Storage','$ionicHistory', function($scope,$state,Storage,$ionicHistory) {
     
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

.controller('aboutCtrl', ['$scope','$state','Storage','$ionicHistory', function($scope,$state,Storage,$ionicHistory) {
     
}])
