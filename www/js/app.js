// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney',[
    'ionic',
    'ngCordova',
    'tdy.controllers',
    'xjz.controllers',
    'zy.controllers',
    'kidney.services',
    'kidney.filters',
    'kidney.directives',
    'monospaced.qrcode',
    'ionic-datepicker'
])

.run(['$ionicPlatform', '$state', 'Storage', 'JM','$rootScope','CONFIG','Communication', '$location','wechat','$window','User','$ionicHistory',function($ionicPlatform, $state, Storage, JM,$rootScope,CONFIG,Communication,$location,wechat,$window,User,$ionicHistory) {
    $ionicPlatform.ready(function() {
        
        //是否登陆
        var isSignIN = Storage.get("isSignIN");
        if (isSignIN == 'YES') {
            $state.go('tab.home');
        }

        var temp = $location.absUrl().split('=')
        // alert(temp)
        if (angular.isDefined(temp[1]) == true)
        {
            var code = temp[1].split('&')[0]
        }
        if (angular.isDefined(temp[2]) == true)
        {
            var state = temp[2].split('#')[0]
        }
        var wechatData = ""
        if (state == 'patient')
        {
            path = 'http://t.go5le.net/?code=' + code
            $window.location.href = path
        }
        else
        {
            wechat.getUserInfo({code:code}).then(function(data){ 
                // alert(1)
                wechatData = data.results
                console.log(wechatData)
                alert(wechatData.openid)
                alert(wechatData.nickname)
                Storage.set('openid',wechatData.openid)
                var logPromise = User.logIn({username:wechatData.openid,password:wechatData.openid,role:"doctor"});
                logPromise.then(function(data){
                    console.log(data);
                    if(data.results==1){
                        Storage.set('validMode',0)
                        $state.go('phonevalid',{phonevalidType:"wechat"})
                    }
                    else if(data.results.mesg=="login success!"){

                        // $scope.logStatus = "登录成功！";
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        User.getUserIDbyOpenId({}).then(function(data)
                        {
                            if (angular.isDefined(data.phoneNo) = true)
                            {
                                Storage.set('USERNAME',data.phoneNo);
                            }
                        },function(err)
                        {
                            console.log(err)
                        })
                        Storage.set('TOKEN',data.results.token);//token作用目前还不明确
                        Storage.set('isSignIn',true);
                        Storage.set('UID',data.results.userId);

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
            },function(err){
              console.log(err)
              // alert(2);
            })
        }

        //用户ID
        var userid = '';
        //记录jmessage当前会话
        $rootScope.conversation = {
            type: null,
            id: ''
        }
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        if (window.JPush) {
            window.JPush.init();
        }
        if (window.JMessage) {
            // window.Jmessage.init();
            JM.init();
            document.addEventListener('jmessage.onUserLogout',function(data){
              console.error(Storage.get(UID) +' log out');
              alert('jmessage user log out: '+Storage.get(UID));
            })
            //打开通知栏消息，属于jmessage
            document.addEventListener('jmessage.onOpenMessage', function(msg) {
                console.info('[jmessage.onOpenMessage]:');
                console.log(msg);
                if(msg.targetType=='group'){
                    window.JMessage.getGroupInfo(msg.targetID,
                        function(response){
                            //'0':团队交流  '1': 未结束病历  '2':已结束病历
                            var res=JSON.stringify(response);
                            if(res.groupDescription=="consultation_open"){
                                $state.go('tab.group-chat', { type:'1',groupId: msg.targetID,teamId:msg.content.stringExtras.teamId});
                            }else if(res.groupDescription=="consultation_close"){
                                $state.go('tab.group-chat', { type:'2',groupId: msg.targetID,teamId:msg.content.stringExtras.teamId});
                            }else{
                                $state.go('tab.group-chat', { type:'0',groupId: msg.targetID,teamId:msg.content.stringExtras.teamId});
                            }
                            console.log(res);
                        },function(err){
                            console.log(err);
                        })
                }else{
                    // window.JMessage.getUserInfo(msg.fromID,msg.fromAppkey,
                    //     function(response){
                    //         console.log(response);
                    //     },function(err){
                    //         console.log(err);
                    //     })
                    if(msg.fromAppkey==CONFIG.appKey){
                        $state.go('tab.detail', { type:'2',chatId: msg.targetID});
                    }else{
                        $state.go('tab.detail', { type:'1',chatId: msg.targetID});
                    }
                }
            }, false);
            //打开通知栏Notification,属于jpush
            document.addEventListener("jpush.openNotification", function (msg) {
                console.info('[jpush.openNotification]:');
                console.log(msg);
                // var alertContent
                if(device.platform == "Android") {
                    if(msg.extras.targetType=='group'){
                        //转发团队
                        var content = JSON.stringify(msg.extras.content);
                            groupId = content.contentStringMap.consultationId;
                            teamId = content.contentStringMap.targetId;
                        if(groupId!=teamId){
                            $state.go('tab.group-chat', { type:'1',groupId: groupId,teamId:teamId});
                        }else{
                            $state.go('tab.group-chat', { type:'0',groupId: groupId,teamId:teamId});
                        }
                    }else{
                        //转发医生
                        if(msg.extras.fromAppkey==CONFIG.appKey){
                            $state.go('tab.detail', { type:'2',chatId: msg.extras.fromName});
                        }else{
                            $state.go('tab.detail', { type:'1',chatId: msg.extras.fromName});
                        }
                    }
                } else {
                }
            }, false)

            //广播'receiveMessage'
            document.addEventListener('jmessage.onReceiveMessage', function(msg) {
                console.info('[jmessage.onReceiveMessage]:');
                console.log(msg);
                $rootScope.$broadcast('receiveMessage', msg);
                if (device.platform == "Android") {
                }
            }, false);

            //显示通知栏消息
            // custom消息内容
            // 患者发送咨询：{
            //     counsel:data.results,
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     fromId:
            //     targetId:
            // }
            // 咨询转发医生：{
            //     counsel:data.results,
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     targetId:DoctorId,
            //     fromId
            // }
            // 咨询转发团队：{
            //     counsel:data.results,
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     targetId:teamId,
            //     fromId:doctorId,
            //     //consultation info
            //     consultationId:
            // }
            // 名片{
            //     type:'contact',
            //     doctorInfo:{},
            //     //转发信息
            //     fromId:
            //     targetId:
            // }
            //显示通知栏消息
            document.addEventListener('jmessage.onReceiveCustomMessage', function(msg) {
                console.info('[jmessage.onReceiveCustomMessage]:' );
                console.log(msg);
                var counsel=JSON.parse(msg.content.contentStringMap.counsel);
                // $rootScope.$broadcast('receiveMessage',msg);
                if (msg.targetType == 'single' && msg.fromName != $rootScope.conversation.id) {
                    if(msg.content.contentStringMap.doctorId==msg.content.contentStringMap.targetId) prefix='[咨询]';
                    else prefix='[咨询转发]';
                    if(msg.content.contentStringMap.type=='card'){
                        if (device.platform == "Android") {
                            window.plugins.jPushPlugin.addLocalNotification(1, prefix+counsel.help, msg.targetName, msg.serverMessageId, 0, msg);
                        } else {
                            window.plugins.jPushPlugin.addLocalNotificationForIOS(0, prefix+counsel.help, 1, msg.serverMessageId, msg);
                        }
                    }else if(msg.content.contentStringMap.type=='contact'){

                    }
                    
                }
                if (msg.targetType == 'group' && msg.targetID != $rootScope.conversation.id) {
                    if(msg.content.contentStringMap.type=='card'){
                        if (device.platform == "Android") {
                                window.plugins.jPushPlugin.addLocalNotification(1, '[团队咨询]', msg.fromNickname, msg.serverMessageId, 0, msg);
                        } else {
                            window.plugins.jPushPlugin.addLocalNotificationForIOS(0, '[团队咨询]', 1, msg.serverMessageId, msg);
                        }
                    }else if(msg.content.contentStringMap.type=='contact'){
                    }
                }

            }, false);
        }
        
        

        //聊天用，防止消息被keyboard遮挡
        window.addEventListener('native.keyboardshow', function(e) {
            $rootScope.$broadcast('keyboardshow', e.keyboardHeight);
        });
        window.addEventListener('native.keyboardhide', function(e) {
            $rootScope.$broadcast('keyboardhide');
        });
    });
}])

// --------路由, url模式设置----------------
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    //android导航栏在顶部解决办法
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('standard');
      
    //注册与登录
    $stateProvider
    //登陆
    .state('signin', {
        cache: false,
        url: '/signin',
        templateUrl: 'partials/others/signin.html',
        controller: 'SignInCtrl'
    })
    .state('agreement', {
      cache: false,
      url: '/agreeOrNot',
      params:{last:null},
      templateUrl: 'partials/others/agreement.html',
      controller: 'AgreeCtrl'
    })   
    .state('phonevalid', {
        url: '/phonevalid',
        cache: false,
        params:{phonevalidType:null},
        templateUrl: 'partials/others/phonevalid.html',
        controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      templateUrl: 'partials/others/setpassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      cache:false,
      url:'/userdetail',
      templateUrl:'partials/others/userDetail.html',
      controller:'userdetailCtrl'
    })

    .state('messages',{
      cache:false,
      url:'/messages',
      templateUrl:'partials/others/AllMessage.html',
      controller:'messageCtrl'
    })
    .state('messagesDetail',{
      cache:false,
      url:'/messagesDetail',
      templateUrl:'partials/others/VaryMessage.html',
      controller:'VaryMessageCtrl'
    })
    
    
    //选项卡
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'partials/tabs.html',
        controller: 'tabCtrl'
    }) 
    
    //主页面
    .state('tab.home', {
        //cache: false,
        url: '/home',
        views: {
            'tab-home':{
                controller: 'homeCtrl',
                templateUrl: 'partials/home/homepage.html'
            }
        }
    })
        
    //咨询
    .state('tab.consult', {
        //cache: false,
        url: '/consult',
        views: {
            'tab-consult':{
                controller: 'consultCtrl',
                templateUrl: 'partials/consult/consult.html'
            }
        }
    })
            
    //患者页面
    .state('tab.patient', {
        // cache: false,
        url: '/patient',
        views: {
            'tab-patient':{
                controller: 'patientCtrl',
                templateUrl: 'partials/patient/patient.html'
            }
        }
    })

    //交流
    .state('tab.groups', {
        // cache: false,
        //type:   '0'=team  '1'=doctor
        url: '/groups/type/:type',
        views: {
            'tab-groups':{
                controller: 'groupsCtrl',
                templateUrl: 'partials/group/groups.html'
            }
        }
    })

    //"我"页面
    .state('tab.me', {
        cache: false,
        url: '/me',
        views: {
            'tab-me':{
                controller: 'meCtrl',
                templateUrl: 'partials/me/mepage.html'
            }
        }
    })

    // views-tab-home

    // views-tab-consult

    //进行中
    .state('tab.doing', {
        // cache: false,
        url: '/doing',
        views: {
            'tab-consult':{
                controller: 'doingCtrl',
                templateUrl: 'partials/consult/doing.html'
            }
        }
    })
    //进行中详情
    .state('tab.detail', {
        // cache: false,
        //[type]:0=已结束;1=进行中;2=医生
        url: '/detail/:type/:chatId',
        views: {
            'tab-consult':{
                controller: 'detailCtrl',
                templateUrl: 'partials/consult/detail.html'
            }
        }
    })
    .state('tab.consult-detail', {
        // cache: false,
        url: '/consult/detail/:consultId',
        views: {
            'tab-consult':{
                controller: 'consultDetailCtrl',
                templateUrl: 'partials/consult/consult-detail.html'
            }
        }
    })
    .state('tab.selectDoc', {
        // cache: false,
        url: '/selectdoc',
        views: {
            'tab-consult':{
                controller: 'selectDocCtrl',
                templateUrl: 'partials/consult/select-doctor.html'
            }
        },
        params:{msg:null}
    })
    .state('tab.selectTeam', {
        // cache: false,
        url: '/selectteam',
        views: {
            'tab-consult':{
                controller: 'selectTeamCtrl',
                templateUrl: 'partials/consult/select-team.html'
            }
        },
        params:{msg:null}
    })
    //已完成
    .state('tab.did', {
        // cache: false,
        url: '/did',
        views: {
            'tab-consult':{
                controller: 'didCtrl',
                templateUrl: 'partials/consult/did.html'
            }
        }
    })

    // views-tab-patient

    //患者详情页面
    .state('tab.patientDetail', {
        // cache: false,
        url: '/patientDetail',
        views: {
            'tab-patient':{
                controller: 'patientDetailCtrl',
                templateUrl: 'partials/patient/patientDetail.html'
            }
        }
    })
    .state('tab.DoctorDiagnose', {
        // cache: false,
        url: '/DoctorDiagnose',
        views: {
            'tab-patient':{
                controller: 'DoctorDiagnoseCtrl',
                templateUrl: 'partials/patient/DoctorDiagnose.html'
            }
        }
    })
    .state('tab.TestRecord', {
        // cache: false,
        url: '/TestRecord',
        views: {
            'tab-patient':{
                controller: 'TestRecordCtrl',
                templateUrl: 'partials/patient/testrecord.html'
            }
        }
    })

    .state('tab.TaskSet', {
        // cache: false,
        url: '/TaskSet',
        views: {
            'tab-patient':{
                controller: 'TaskSetCtrl',
                templateUrl: 'partials/patient/TaskSet.html'
            }
        }
    })

    .state('tab.HealthInfo', {
        // cache: false,
        url: '/HealthInfo',
        views: {
            'tab-patient':{
                controller: 'HealthInfoCtrl',
                templateUrl: 'partials/patient/HealthInfo.html'
            }
        }
    })

    .state('tab.HealthInfoDetail', {
        // cache: false,
        url: '/HealthInfoDetail',
        params: {id:null},
        views: {
            'tab-patient':{
                controller: 'HealthDetailCtrl',
                templateUrl: 'partials/patient/editHealthInfo.html'
            }
        }
    })        

    // views-tab-groups
    .state('tab.new-group', {
        url: '/newgroup',
        views: {
            'tab-groups': {
                templateUrl: 'partials/group/new-group.html',
                controller: 'NewGroupCtrl'
            }
        }
    })
    .state('tab.groups-search', {
        url: '/groupsearch',
        views: {
            'tab-groups': {
                templateUrl: 'partials/group/groups-search.html',
                controller: 'GroupsSearchCtrl'
            }
        }
    })
    .state('tab.group-add', {
            url: '/groups/add/:teamId',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-add.html',
                    controller: 'GroupAddCtrl'
                }
            }
        })
    .state('tab.group-kick', {
            url: '/groups/kick',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-kick.html',
                    controller: 'GroupKickCtrl'
                }
            },
            params:{teamId:null}
        })
    .state('tab.group-add-member', {
            //type : 'new'表示从新建组进来的，不是'new'就是已有team加成员
            url: '/groups/addmember/:type',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-add-member.html',
                    controller: 'GroupAddMemberCtrl'
                }
            },
            params:{teamId:null}
        })
    .state('tab.group-detail', {
            url: '/groups/detail',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-detail.html',
                    controller: 'GroupDetailCtrl'
                }
            },
            params:{teamId:null}
        })
    .state('tab.group-qrcode', {
            url: '/groups/qrcode',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-qrcode.html',
                    controller: 'GroupQrcodeCtrl'
                }
            },
            params:{teamId:null}
        })
    .state('tab.group-chat', {
        //'0':团队交流  '1': 未结束病历  '2':已结束病历
            url: '/groups/chat',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/group-chat.html',
                    controller: 'GroupChatCtrl'
                    // params:{'group':null,'type':'0','groupId':null}
                },
                // params:['group','typr','groupId']
            },
            params:{'type':'0','teamId':null,'groupId':null}
            // params:['group','typr','groupId']
        })
    .state('tab.group-conclusion', {
            url: '/groups/conclusion',
            views: {
                'tab-groups': {
                    templateUrl: 'partials/group/conclusion.html',
                    controller: 'GroupConclusionCtrl'
                }
            },
            params:{consultationId:null,teamId:null}
        })
    .state('tab.group-patient', {
        // cache: false,
        url: '/group/patients',
        views: {
            'tab-groups':{
                controller: 'groupPatientCtrl',
                templateUrl: 'partials/group/group-patient.html'
            }
        },
        params:{teamId:null}
    })
    //医生个人信息
    .state('tab.group-profile', {
        // cache: false,
        url: '/group/doctor/profile',
        views: {
            'tab-groups':{
                controller: 'doctorProfileCtrl',
                templateUrl: 'partials/group/profile.html'
            }
        },
        params:{memberId:null}
    })

    // views-tab-me

    //schedual
    .state('tab.schedual', {
        // cache: false,
        url: '/schedual',
        views: {
            'tab-me':{
                controller: 'schedualCtrl',
                templateUrl: 'partials/me/schedual.html'
            }
        }
    })
    //我的二维码
    .state('tab.QRcode', {
        // cache: false,
        url: '/qrcode',
        views: {
            'tab-me':{
                controller: 'QRcodeCtrl',
                templateUrl: 'partials/me/qrcode.html'
            }
        }
    })
            
    //我的信息
    .state('tab.myinfo', {
        // cache: false,
        url: '/myinfo',
        views: {
            'tab-me':{
                controller: 'myinfoCtrl',
                templateUrl: 'partials/me/myinfo.html'
            }
        }
    })
            
    //收费定制
    .state('tab.myfee', {
        // cache: false,
        url: '/myfee',
        views: {
            'tab-me':{
                controller: 'myfeeCtrl',
                templateUrl: 'partials/me/myfee.html'
            }
        }
    })

    //我的评价
    .state('tab.feedback', {
        // cache: false,
        url: '/feedback',
        views: {
            'tab-me':{
                controller: 'feedbackCtrl',
                templateUrl: 'partials/me/feedback.html'
            }
        }
    })

    //设置
    .state('tab.set', {
        // cache: false,
        url: '/set',
        views: {
            'tab-me':{
                controller: 'setCtrl',
                templateUrl: 'partials/me/set.html'
            }
        }
    })
    // 设置内容页
    .state('tab.set-content', {
        url: '/me/set/set-content/:type',
            views: {
            'tab-me': {
                templateUrl: 'partials/me/set/set-content.html',
                controller: 'set-contentCtrl'
            }
        }
    })

    //关于
    .state('tab.about', {
        // cache: false,
        url: '/about',
        views: {
            'tab-me':{
                controller: 'myinfoCtrl',
                templateUrl: 'partials/me/about.html'
            }
        }
    })


    $urlRouterProvider.otherwise('/signin');

})
.controller('tabCtrl',['$state','$scope',function($state,$scope){
    $scope.goConsult = function(){
        setTimeout(function() {
        $state.go('tab.consult', {});
      },20);
    }
    $scope.goGroups = function(){
        setTimeout(function() {
        $state.go('tab.groups', {type:'0'});
      },20);
    }
    $scope.goPatient = function(){
        setTimeout(function() {
        $state.go('tab.patient', {});
      },20);
    }

}])