angular.module('xjz.controllers', ['ionic', 'kidney.services'])
//新建团队
.controller('NewGroupCtrl', ['$scope', '$state', '$ionicLoading', '$rootScope', 'Communication', 'Storage', 'Doctor','$filter', function($scope, $state, $ionicLoading, $rootScope, Communication, Storage, Doctor,$filter) {
    $rootScope.newMember = [];
    $scope.members = [];
    $scope.team = {
        teamId: '',
        name: '',
        sponsorId: '',
        sponsorName: '',
        description: ''
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.members = $rootScope.newMember;
    });

     $scope.confirm = function(){
        if($scope.team.name=='' || $scope.team.description==''){
            $ionicLoading.show({ template: '请完整填写信息', duration: 1500 });
        }else if(!$scope.members){
            $ionicLoading.show({ template: '请至少添加一个成员', duration: 1500 });
        }else{
            upload();
            $ionicLoading.show();
        }
    }

    function upload() {
        var time = new Date();
        $scope.team.teamId = $filter('date')(time, 'ssmsssH');
        $scope.team.sponsorId = Storage.get('UID');
        Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
            .then(function(data) {
                $scope.team.sponsorName = data.results.name;
                Communication.newTeam($scope.team)
                    .then(function(data) {
                        //add members
                        Communication.insertMember({ teamId: $scope.team.teamId, members: $rootScope.newMember });

                        $ionicLoading.show({ template: '创建成功'});
                        setTimeout(function() {
                            $ionicLoading.hide();
                            $state.go('tab.groups', { type: '0' });
                        }, 1500);
                    }, function(err) {
                        $ionicLoading.show({ template: '创建失败', duration: 1500 });
                        console.log(err);
                    });
            })
    }


    $scope.addMember = function() {
        $state.go('tab.group-add-member', { type: 'new' });
    }
}])
//团队查找

.controller('GroupsSearchCtrl', ['$scope', '$state','Communication', 'wechat','Storage','$location',function($scope, $state,Communication,wechat,Storage,$location) {
    $scope.search='';
    $scope.noteam=0;
    $scope.Searchgroup = function () {
        Communication.getTeam({ teamId: $scope.search })
            .then(function (data) {
                $scope.teamresult = data;
                if (data.length == 0) {
                    $ionicLoading.show({ template: '查无此群', duration: 1000 })
                }
            }, function (err) {
                console.log(err);
            })
    }


     $scope.QRscan = function(){
        var config = "";
        var path = $location.absUrl().split('#')[0]
        wechat.settingConfig({url:path}).then(function(data){
          config = data.results;
          config.jsApiList = ['scanQRCode']
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
                jsApiList: ['scanQRCode'],
                success: function(res) {
                    wx.scanQRCode({
                      needResult:1,
                      scanType: ['qrCode','barCode'],
                      success: function(res) {
                        var result = res.resultStr;
                        $state.go('tab.group-add',{teamId:result})
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
      }
}])
//医生查找
.controller('DoctorSearchCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG) {

    //get groupId via $state.params.groupId
    $scope.moredata = true;
    $scope.issearching = true;
    $scope.isnotsearching = false;
    $scope.group = {
        members: []
    }
    $scope.doctors = [];
    $scope.alldoctors = [];
    $scope.skipnum = 0;
    $scope.loadMore = function () {
        Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function (data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');

                $scope.alldoctors = $scope.alldoctors.concat(data.results);
                $scope.doctors = $scope.alldoctors;
                $scope.nexturl = data.nexturl;
                var skiploc = data.nexturl.indexOf('skip');
                $scope.skipnum = data.nexturl.substring(skiploc + 5);
                if (data.results.length == 0) { $scope.moredata = false } else { $scope.moredata = true };
            }, function (err) {
                console.log(err);
            })
    }
    $scope.goSearch = function() {
        $scope.isnotsearching = true;
        $scope.issearching = false;
        $scope.moredata = false;
        Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function(data) {
                $scope.doctors = data.results;
                if (data.results.length == 0) {
                    $ionicLoading.show({ template: '查无此人', duration: 1000 })
                }
            }, function(err) {
                console.log(err);
            })
    }
    $scope.closeSearch = function() {
        $scope.issearching = true;
        $scope.isnotsearching = false;
        $scope.moredata = true;
        $scope.doctors = $scope.alldoctors;
    }

    $scope.doctorClick = function(doc) {
        $state.go('tab.detail', { type: '2', chatId:doc });
    }
}])
//我的团队
.controller('groupsCtrl', ['$scope', '$http', '$state', '$ionicPopover','$ionicScrollDelegate', 'Doctor', 'Storage', 'Patient','arrTool','$q','wechat','$location','New','$interval',function($scope, $http, $state, $ionicPopover,$ionicScrollDelegate, Doctor, Storage, Patient,arrTool,$q,wechat,$location,New,$interval) {
    $scope.countAllDoc='?';
    $scope.query = {
        name: ''
    }
    $scope.params = {
        isTeam: true,
        showSearch: false,
        updateTime: 0
    }
    var countDocs=function()
    {
        Doctor.getDocNum()
        .then(function(data)
        {
            $scope.countAllDoc=data.results;
        },function(err)
        {
            console.log(err)
        })
    }
    countDocs();
    $scope.load = function(force) {
        var time = Date.now();
        if (!force && time - $scope.params.updateTime < 60000){
            New.addNews('13',Storage.get('UID'),$scope.teams,'teamId')
            .then(function(teams){
                $scope.teams=teams;
            })
            New.addNestNews('12',Storage.get('UID'),$scope.doctors,'userId','doctorId')
            .then(function(doctors){
                $scope.doctors=doctors;
            })
        }else{
            $scope.params.updateTime = time;
            Doctor.getMyGroupList({ userId: Storage.get('UID') })
                .then(function(data) {
                    return New.addNews('13',Storage.get('UID'),data,'teamId')
                    .then(function(teams){
                        return $scope.teams=teams;
                    });
                }).then(function(data){
                    console.log(data);
                });
            $interval(function(){
                Doctor.getRecentDoctorList({ userId: Storage.get('UID') })
                    .then(function(data) {
                        New.addNestNews('12',Storage.get('UID'),data.results,'userId','doctorId')
                        .then(function(doctors){
                            $scope.doctors=doctors;
                        });
                    }, function(err) {
                        console.log(err)
                    });
            },2000,3);
        }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        //type:   '0'=team  '1'=doctor
        $scope.params.isTeam = $state.params.type == '0';
        $scope.params.showSearch = false;
    })
    $scope.$on('$ionicView.enter', function() {
        $scope.load(true);
    })
    $scope.doRefresh = function(){
        $scope.load(true);
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }
    $scope.showTeams = function() {
        $scope.load();
        $ionicScrollDelegate.scrollTop();
        $scope.params.isTeam = true;
    }
    $scope.showDocs = function() {
        $scope.load();
        $ionicScrollDelegate.scrollTop();
        $scope.params.isTeam = false;
    }
    $scope.search = function() {
        $scope.params.showSearch = true;
    }
    $scope.closeSearch = function() {
        $scope.params.showSearch = false;
    }
    $scope.clearSearch = function() {
            $scope.query.name = '';
        }
    //popover option
    var options = [{
        name: '搜索团队',
        href: '#/tab/groupsearch'
    }, {
        name: '新建团队',
        href: '#/tab/newgroup'
    }, {
        name: '搜索医生',
        href: '#/tab/doctorsearch'
    }];
    $ionicPopover.fromTemplateUrl('partials/group/pop-menu.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.options = options;
        $scope.popover = popover;
    });

    $scope.itemClick = function(ele, team) {
        if (ele.target.id == 'discuss') $state.go("tab.group-patient", { teamId: team.teamId });
        else $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId });
    }
    $scope.doctorClick = function(ele, doc) {
        if (ele.target.id == 'profile') $state.go("tab.group-profile", { memberId: doc.userId });
        else $state.go('tab.detail', { type: '2', chatId: doc.userId });
    }

    $scope.$on('$ionicView.beforeLeave', function() {
        if ($scope.popover) $scope.popover.hide();
    })
}])
//团队病历
.controller('groupPatientCtrl', ['$scope', '$http', '$state', 'Storage', '$ionicHistory','Doctor','$ionicLoading','New', function($scope, $http, $state, Storage, $ionicHistory,Doctor,ionicLoading,New) {

    $scope.grouppatients0 = "";
    $scope.grouppatients1 = "";


    $scope.params = {
        teamId: ''
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.grouppatients1 = "";
        $scope.grouppatients2 = "";
        $scope.params.teamId = $state.params.teamId;
        $scope.load();
    });
    $scope.load = function() {
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 1 }) //1->进行中
            .then(function(data) {
                New.addNews($scope.params.teamId,Storage.get('UID'),data.results,'consultationId')
                .then(function(pats){
                    $scope.grouppatients0 = pats;
                },function(err){

                });
            }, function(err) {
                console.log(err)
            })
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 0 }) //0->已处理
            .then(function(data) {
                New.addNews($scope.params.teamId,Storage.get('UID'),data.results,'consultationId')
                .then(function(pats){
                    $scope.grouppatients1 = pats;
                },function(err){

                });
            }, function(err) {
                console.log(err)
            })
    }

    $scope.doRefresh = function(){
        $scope.load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }
    $scope.enterChat = function(type, patient) {
        $state.go('tab.group-chat', { type: type, teamId: $scope.params.teamId, groupId: patient.consultationId });
    }

    $scope.backToGroups = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('tab.groups', { type: '0' });
    }
}])

.controller('GroupAddCtrl', ['$scope', '$state','$ionicHistory','Communication','$ionicPopup', 'Storage','Doctor','$ionicLoading','CONFIG','$http',function($scope, $state,$ionicHistory,Communication,$ionicPopup,Storage,Doctor,$ionicLoading,CONFIG,$http) {
    $scope.$on('$ionicView.beforeEnter',function(){
        $scope.me = [{ userId: '', name: '', photoUrl: '' }];
        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {
                $scope.group = data.results;
                if (data.results.sponsorId == Storage.get('UID')) $scope.imnotin = false;
                else $scope.imnotin = true;
            }, function (err) {
                console.log(err);
            })
    })
    $scope.request = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要加入吗?',
            // template: ''
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function (res) {
            if (res) {
                Doctor.getDoctorInfo({ userId: Storage.get('UID') })
                    .then(function (data) {
                        $scope.me[0].userId = data.results.userId;
                        $scope.me[0].name = data.results.name;
                        $scope.me[0].photoUrl = data.results.photoUrl;
                        var idStr = $scope.me[0].userId;
                        Communication.insertMember({ teamId: $state.params.teamId, members: $scope.me })
                            .then(function (data) {
                                if (data.result == "更新成员成功") {
                                    $ionicLoading.show({ template: '加入成功', duration: 1500 });
                                    $ionicHistory.nextViewOptions({ disableBack: true });
                                    $state.go('tab.groups', { type: '0' });
                                }
                                else { $ionicLoading.show({ template: '你已经是成员了', duration: 1500 }) };
                            })

                    });

            }
        });
    }

}])
//"咨询”问题详情
.controller('detailCtrl', ['$scope', '$state', '$rootScope', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', '$http', 'CONFIG', 'arrTool', 'Communication','Storage', 'wechat','$location','Doctor','$q','Counsel','Account','New','Patient',function($scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicHistory, $ionicPopover, $ionicPopup, Camera, voice, $http, CONFIG, arrTool, Communication,Storage,wechat,$location,Doctor,$q,Counsel,Account,New,Patient) {
    $scope.input = {
        text: ''
    }

    var path = $location.absUrl().split('#')[0]
    $scope.params = {
            //[type]:0=已结束;1=进行中;2=医生
            type: '',
            title: '',
            msgCount: 0,
            helpDivHeight: 0,
            moreMsgs: true,
            UID:Storage.get('UID'),
            realCounselType:'',
            newsType:'',
            targetRole:'',
            counsel:{},
            loaded:false,
            recording:false
        }
    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.timer=[];
        $scope.photoUrls={};
        $scope.msgs = [];
        $scope.params.chatId = $state.params.chatId;
        $scope.params.type = $state.params.type;
        $scope.params.loaded = false;
        $scope.params.msgCount = 0;
        $scope.params.newsType = $scope.params.type=='2'?'12':'11';
        console.log($scope.params)

        if ($scope.params.type == '2') {
            $scope.params.title = "医生交流";
            $scope.params.targetRole = 'doctor';
            Doctor.getDoctorInfo({ userId: $scope.params.chatId })
                .then(function(data) {
                    $scope.params.targetName = data.results.name;
                    $scope.photoUrls[data.results.userId] = data.results.photoUrl;
                });
        } else {
            $scope.params.title = "咨询";
            $scope.params.targetRole = 'patient';
            Patient.getPatientDetail({userId:$state.params.chatId})
             .then(function(data){
                $scope.params.targetName = data.results.name;
                $scope.photoUrls[data.results.userId]=data.results.photoUrl;
            });
            $scope.params.key = CONFIG.crossKey;
            //获取counsel信息
            Communication.getCounselReport({counselId:$state.params.counselId})
            .then(function(data){
                console.log(data)
                $scope.params.counsel = data.results;
                $scope.counseltype= data.results.type=='3'?'2':data.results.type;
                $scope.counselstatus=data.results.status;
                $scope.params.type = data.results.status;
                if ($scope.counselstatus == '1') $scope.params.title += "-进行中";
                $scope.params.realCounselType=data.results.type;
                Account.getCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId})
                .then(function(res){
                    if($scope.params.loaded){
                        return sendNotice($scope.counseltype,$scope.counselstatus,res.result.count);
                    }else{
                        var connectWatcher = $scope.$watch('params.loaded',function(newv,oldv){
                            if(newv) {
                                connectWatcher();
                                return sendNotice($scope.counseltype,$scope.counselstatus,res.result.count);
                            }
                        });
                    }
                });

            },function(err){
                console.log(err);
            })
        }


        var loadWatcher = $scope.$watch('params.loaded',function(newv,oldv){
            if(newv) {
                loadWatcher();
                if($scope.msgs.length==0) return;
                var lastMsg=$scope.msgs[$scope.msgs.length-1];
                if(lastMsg.fromID==$scope.params.UID) return;
                return New.insertNews({userId:lastMsg.targetID,sendBy:lastMsg.fromID,type:$scope.params.newsType,readOrNot:1});
            }
        });
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
            toBottom(true,400);
            $scope.params.loaded = true;
        });
    });

    $scope.$on('$ionicView.enter', function() {
        if ($rootScope.conversation) {
            $rootScope.conversation.type = 'single';
            $rootScope.conversation.id = $state.params.chatId;
        }

        Doctor.getDoctorInfo({userId:$scope.params.UID})
        .then(function(response){
            thisDoctor=response.results;
            $scope.photoUrls[response.results.userId]=response.results.photoUrl;

            socket.emit('newUser',{user_name:response.results.name,user_id:$scope.params.UID,client:'wechatdoctor'});

            socket.on('err',function(data){
                console.error(data)
                // $rootScope.$broadcast('receiveMessage',data);
            });
            socket.on('getMsg',function(data){
                console.info('getMsg');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.fromID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
                    $scope.$apply(function(){
                        insertMsg(data.msg);
                    });
                    if($scope.params.type != '2' && data.msg.contentType=='custom' && (data.msg.content.type=='card' || data.msg.content.type=='counsel-payment')){
                        Communication.getCounselReport({counselId:data.msg.content.counselId})
                        .then(function(data){
                            console.log(data)
                            $scope.params.counsel = data.results;
                            $scope.counseltype= data.results.type=='3'?'2':data.results.type;
                            $scope.counselstatus=data.results.status;
                            $scope.params.realCounselType=data.results.type;
                        },function(err){
                            console.log(err);
                        })
                    }
                    if(data.msg.contentType=='custom' && data.msg.content.type=='counsel-upgrade'){
                        $scope.$apply(function(){
                            $scope.counseltype='2';
                        });
                        $scope.counselstatus=1;
                    }
                    New.insertNews({userId:$scope.params.UID,sendBy:$scope.params.chatId,type:$scope.params.newsType,readOrNot:1});
                }
            });
            socket.on('messageRes',function(data){
                console.info('messageRes');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.targetID == $state.params.chatId && data.msg.newsType == $scope.params.newsType) {
                    $scope.$apply(function(){
                        insertMsg(data.msg);
                    });
                    if($scope.counselstatus==1 && $scope.counseltype==1 && !(data.msg.contentType=='custom' && data.msg.content.type=='count-notice')){
                        Account.modifyCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,modify:'-1'})
                        .then(function(){
                            Account.getCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId})
                            .then(function(data){
                                if(data.result.count<=0){
                                    $scope.counselstatus=0;
                                    $scope.params.title="咨询";
                                    endCounsel(1);
                                }
                            });
                        });
                    }
                }
            });
        },function(err){
            console.log(err);
        })
        wechat.settingConfig({ url: path }).then(function(data) {
            config = data.results;
            config.jsApiList = ['startRecord','stopRecord','playVoice','chooseImage','uploadVoice', 'uploadImage']
            wx.config({
                debug: false,
                appId: config.appId,
                timestamp: config.timestamp,
                nonceStr: config.nonceStr,
                signature: config.signature,
                jsApiList: config.jsApiList
            })
            wx.error(function(res) {
                console.error(res);
                alert(res.errMsg)
            })
        });
        imgModalInit();
    })

    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height ;
        toBottom(true,100);
        // setTimeout(function() {
        //     $scope.scrollHandle.scrollBottom(true);
        // }, 100);
    })
    $scope.$on('keyboardhide', function(event) {
        $scope.params.helpDivHeight = 0;
    })
    $scope.$on('$ionicView.beforeLeave', function() {
        for(var i in $scope.timer) clearTimeout($scope.timer[i]);
        socket.off('messageRes');
        socket.off('getMsg');
        socket.off('err');
        socket.emit('disconnect');
        // socket.close();
        if ($scope.popover) $scope.popover.hide();
    })
    $scope.$on('$ionicView.leave', function() {
        if ($scope.params.type == '2' && $scope.msgs.length)
            Communication.updateLastTalkTime($scope.params.chatId, $scope.msgs[$scope.msgs.length - 1].createTimeInMillis);
        $scope.msgs = [];
        if ($scope.modal) $scope.modal.remove();
        $rootScope.conversation.type = null;
        $rootScope.conversation.id = '';
    })
    function sendNotice(type,status,cnt){
        // var t = setTimeout(function(){
            return sendCnNotice(type,status,cnt);
        // },2000);
        // $scope.timer.push(t);
    }
    function sendCnNotice(type,status,cnt){
        var len=$scope.msgs.length;
        if(len==0 || !($scope.msgs[len-1].content.type=='count-notice' && $scope.msgs[len-1].content.count==cnt)){
            var bodyDoc='';
            if(type!='1'){
                if(status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='患者提问不限次数';
                    bodyPat='您可以不限次数进行提问';
                }
            }else{
                if(cnt<=0 || status=='0'){
                    bodyDoc='您仍可以向患者追加回答，该消息不计费';
                    bodyPat='您没有提问次数了。如需提问，请新建咨询或问诊';
                }else{
                    bodyDoc='您还需要回答'+cnt+'个问题';
                    bodyPat='您还有'+cnt+'次提问机会';
                }
            }

            var notice={
                type:'count-notice',
                ctype:type,
                cstatus:status,
                count:cnt,
                bodyDoc:bodyDoc,
                bodyPat:bodyPat,
                counseltype:$scope.counseltype
            }
            var msgJson={
                clientType:'wechatdoctor',
                contentType:'custom',
                fromID:thisDoctor.userId,
                fromName:thisDoctor.name,
                fromUser:{
                    // avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                },
                targetID:$scope.params.chatId,
                targetName:$scope.params.targetName,
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:$scope.params.newsType,
                targetRole:$scope.params.targetRole,
                content:notice
            }
            $scope.msgs.push(msgJson);
            // socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
        }
    }
    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.scrollBottom = function() {
        // $scope.showVoice = false;
        // $scope.showMore = false;
        toBottom(true);
    }
    $scope.getMsg = function(num) {
        console.info('getMsg');
        return $q(function(resolve,reject){
            var q={
                messageType:'1',
                newsType:$scope.params.newsType,
                id1:Storage.get('UID'),
                id2:$scope.params.chatId,
                skip:$scope.params.msgCount,
                limit:num
            }
            Communication.getCommunication(q)
            .then(function(data){
                console.log(data);
                var d=data.results;
                $scope.$broadcast('scroll.refreshComplete');
                if(d=='没有更多了!') return noMore();
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0 ) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                    // });
                }
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            });
        })

    }

    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }
    //长按工具条
    var options = [{
        name: '转发医生',
    }, {
        name: '转发团队',
    }]
    $ionicPopover.fromTemplateUrl('partials/others/toolbox-pop.html', {
        scope: $scope,
    }).then(function(popover) {
        $scope.options = options;
        $scope.popover = popover;
    });
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            // $scope.modal.show();
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }

    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb);
        $scope.modal.show();
    })
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    }
    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.params.audio=args[1];
        wx.downloadVoice({
            serverId: args[1].mediaId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
            isShowProgressTips: 0, // 默认为1，显示进度提示
            success: function (res) {
                // var localId = res.localId; // 返回音频的本地ID
                wx.playVoice({
                    localId: res.localId// 需要播放的音频的本地ID，由stopRecord接口获得
                });
            }
        });
    })

    $scope.$on('holdmsg', function(event, args) {
        $scope.holdId = args[1];
        console.log(args)
        event.stopPropagation();
        $scope.popover.show(args[2]);
    })
    $scope.$on('viewcard', function(event, args) {
        console.log(args[2]);
        event.stopPropagation();
        if (args[2].target.tagName == "IMG") {
            $scope.imageHandle.zoomTo(1, true);
            $scope.imageUrl = args[2].target.currentSrc;
            console.log(args[2].target.attributes.hires.nodeValue);
            $scope.modal.show();
        } else {
            Storage.set('getpatientId',args[1].content.patientId);
            $state.go('tab.patientDetail');
            // $state.go('tab.consult-detail',{consultId:args[1]});
        }
        // $state.go('tab.consult-detail',{consultId:args[1]});
    })
    $scope.toolChoose = function(data) {
        // console.log(data);

        var content = $scope.msgs[arrTool.indexOf($scope.msgs, 'createTimeInMillis', $scope.holdId)].content;
        if (data == 0) $state.go('tab.selectDoc', { msg: content });
        if (data == 1) $state.go('tab.selectTeam', { msg: content });
    }
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
        if(args[1].direct=='receive'){
            if($scope.params.type=='2'){
                return $state.go('tab.group-profile', { memberId: args[1].fromID });
            }else{
                Storage.set('getpatientId',args[1].fromID);
                return $state.go('tab.patientDetail');
            }

        }
    })
    function endCounsel(type){
        Counsel.changeStatus({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,type:type,status:0})
        .then(function(data){
            var endlMsg={
                type:'endl',
                info:"咨询已结束",
                docId:thisDoctor.userId,
                counseltype:1
            }
            if(type==2){
                endlMsg.info="问诊已结束";
                endlMsg.counseltype=2;
            }
            var msgJson={
                clientType:'wechatdoctor',
                contentType:'custom',
                fromID:thisDoctor.userId,
                fromName:thisDoctor.name,
                fromUser:{
                    avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                },
                targetID:$scope.params.chatId,
                targetName:$scope.params.targetName,
                targetType:'single',
                status:'send_going',
                createTimeInMillis: Date.now(),
                newsType:$scope.params.newsType,
                targetRole:'patient',
                content:endlMsg
            }
            socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
            $scope.counselstatus='0';
        });
        Counsel.changeCounselStatus({counselId:$state.params.counselId,status:0})
    }
    $scope.finishConsult = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要结束此次咨询吗?',
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                Account.modifyCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,modify:'900'})
                .then(function(){
                    endCounsel($scope.params.realCounselType);
                },function(err){
                    console.error(err);
                })
            } else {
            }
        });
    }
    $scope.updateMsg = function (msg, pos) {
        console.info('updateMsg');
        if (msg.contentType == 'image') msg.content.thumb = CONFIG.mediaUrl + msg.content['src_thumb'];
        msg.direct = $scope.msgs[pos].direct;

        if (pos == 0) {
            msg.diff = true;
        } else if (msg.hasOwnProperty('time')) {
            var m = $scope.msgs[pos - 1];
            if (m.contentType == 'custom' && m.content.type == 'count-notice' && pos>1) {
                m = $scope.msgs[pos - 2];
            }
            if (m.hasOwnProperty('time')) {
                msg.diff = (msg.time - m.time) > 300000 ? true : false;
            } else {
                msg.diff = false;
            }
        }
        $scope.msgs[pos] = msg;
    }
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        var len = $scope.msgs.length;
        if (msg.hasOwnProperty('time')) {
            if (len == 0) {
                msg.diff = true;
            } else {
                var m = $scope.msgs[len - 1];
                if (m.contentType == 'custom' && m.content.type == 'count-notice') {
                    m = $scope.msgs[len - 2];
                }
                if (m.hasOwnProperty('time')) {
                    msg.diff = (msg.time - m.time) > 300000 ? true : false;
                }
            }
        }
        msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        if(msg.contentType=='image') {
            msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            $http.get(msg.content.thumb).then(function(data){
                $scope.msgs.push(msg);
                toBottom(true,400);
                toBottom(true,800);
                $scope.params.msgCount++;
            })
        }else{
            $scope.msgs.push(msg);
            toBottom(true,100);
            $scope.params.msgCount++;
        }
    }
    function insertMsg(msg){
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos==-1){
            $scope.pushMsg(msg);
        }else{
            $scope.updateMsg(msg,pos);
        }
    }
    // send message--------------------------------------------------------------------------------

    function msgGen(content,type,local){
        var data={};
        if(type=='text'){
            data={
                text:content
            };
        }else if(type=='image'){
            data={
                mediaId:content[0],
                mediaId_thumb:content[1],
                src:'',
                src_thumb:''
            };
        }else if(type=='voice'){
            data={
                mediaId:content,
                src:''
            };
        }
        var msgJson={
            clientType:'wechatdoctor',
            contentType:type,
            fromID:$scope.params.UID,
            fromName:thisDoctor.name,
            fromUser:{
                avatarPath: CONFIG.mediaUrl+'uploads/photos/resized'+$scope.params.UID+'_myAvatar.jpg'
            },
            targetID:$scope.params.chatId,
            targetName:$scope.params.targetName,
            targetType:'single',
            status:'send_going',
            createTimeInMillis: Date.now(),
            newsType:$scope.params.newsType,
            targetRole:$scope.params.targetRole,
            content:data
        }
        if(local){
            if(type=='image'){
                msgJson.content.localId=content[2];
                msgJson.content.localId_thumb=content[3];
            }else if(type=='voice'){
                msgJson.content.localId=content[1];
            }
        }
        return msgJson;
    }
    function sendmsg(content,type){
        // var data={};
        // if(type=='text'){
        //     data={
        //         text:content
        //     };
        // }else if(type=='image'){
        //     data={
        //         mediaId:content[0],
        //         mediaId_thumb:content[1],
        //         src:'',
        //         src_thumb:''
        //     };
        // }else if(type=='voice'){
        //     data={
        //         mediaId:content,
        //         src:''
        //     };
        // }
        // var msgJson={
        //     contentType:type,
        //     fromName:$scope.params.UID,
        //     fromUser:{
        //         avatarPath:''
        //     },
        //     targetID:$scope.params.chatId,
        //     targetName:'',
        //     targetType:'single',
        //     status:'send_going',
        //     createTimeInMillis: Date.now(),
        //     // _id:'',
        //     content:data
        // }
        var msgJson=msgGen(content,type);
        // if(type=='text'){
            // $scope.pushMsg(msgJson);
            // toBottom(true);
        // }
        console.info('socket.connected'+socket.connected);
        socket.emit('message',{msg:msgJson,to:$scope.params.chatId,role:'doctor'});
        // if(type=='image'){
        //     msgJson.content.localId=content[2];
        //     msgJson.content.localId_thumb=content[3];
        // }else if(type=='voice'){
        //     msgJson.content.localId=content[1];
        // }
        // $scope.pushMsg(msgJson);
        toBottom(true);
    }
    $scope.submitMsg = function() {
        if($scope.params.newsType=='11') var targetRole='patient';
        else var targetRole = 'doctor';
        var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab9c316b3076535d&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state='+targetRole +'_'+ $scope.params.newsType+ '_'+ $state.params.type+'_'+$scope.params.UID+'_'+$state.params.counselId+ '&#wechat_redirect';
        var template = {
            "userId": $scope.params.chatId, //患者的UID
            "role": "patient",
            "postdata": {
                "template_id": "N_0kYsmxrQq-tfJhGUo746G8Uem6uHZgK138HIBKI2I",
                "url":actionUrl, 
                "data": {
                    "first": {
                        "value": "您的"+($scope.counseltype==1?'咨询':'问诊') +$scope.params.counsel.symptom+"已被回复！", //XXX取那个咨询或问诊的标题
                        "color": "#173177"
                    },
                    "keyword1": {
                        "value": $scope.params.counsel.help, //咨询的问题
                        "color": "#173177"
                    },
                    "keyword2": {
                        "value": $scope.input.text, //医生的回复
                        "color": "#173177"
                    },
                    "keyword3": {
                        "value": thisDoctor.name, //回复医生的姓名
                        "color": "#173177"
                    },
                    "remark": {
                        "value": "感谢您的使用！",
                        "color": "#173177"
                    }
                }
            }
        }
        wechat.messageTemplate(template);
        sendmsg($scope.input.text,'text');
        $scope.input.text = '';
    }
    //get image
    $scope.getImage = function(type) {
        $scope.showMore = false;
        var ids=['',''];
        if(type=='cam') var st=['camera'];
        else var st = ['album'];
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: st, // 可以指定来源是相册还是相机，默认二者都有
            success: function (response) {
                console.log(response);
                ids=ids.concat(response.localIds);
                // var promises=[];
                // promises.push(wxUploadImage(response.localIds[0]));
                // promises.push(wxUploadImage(response.localIds[1]));
                // console.log(promises);
                // $q.all(promises)
                // .then(function(dataArr){
                //     console.log(dataArr);
                //     ids[0]=dataArr[0];
                //     ids[1]=dataArr[1];
                //     sendmsg(ids,'image');
                // },function(errArr){
                //     console.log(errArr);
                // })
                // var m=msgGen(ids,'image',true)
                // $scope.pushMsg(m);
                // toBottom(true);
                wx.uploadImage({
                    localId: response.localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (res) {
                        console.log(res);
                        ids[0]=res.serverId; // 返回图片的服务器端ID
                        // if(cnt)
                            sendmsg(ids,'image');
                        // else cnt++;
                    }
                });
                // wx.uploadImage({
                //     localId: response.localIds[1], // 需要上传的图片的本地ID，由chooseImage接口获得
                //     isShowProgressTips: 0, // 默认为1，显示进度提示
                //     success: function (res) {
                //         console.log(res);
                //         ids[1]=res.serverId; // 返回图片的服务器端ID
                //         if(cnt)
                //             sendmsg(ids,'image');
                //         else cnt++;
                //         // sendmsg(serverId,'image');
                //     }
                // });
            }
        });
    }
    // function wxUploadImage(localId){
    //     return $q(function(resolve,reject){
    //         wx.uploadImage({
    //             localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
    //             isShowProgressTips: 0, // 默认为1，显示进度提示
    //             success: function (res) {
    //                 if(res.errMsg=="uploadImage:ok")
    //                     resolve(res.serverId);
    //                 else
    //                     reject(res);
    //             }
    //         });
    //     });
    // }
    //get voice
    $scope.getVoice = function() {
        wx.startRecord();
        $scope.params.recording=true;
    }
    $scope.stopAndSend = function() {
        wx.stopRecord({
            success: function (res) {
                var ids=['',res.localId];
                var m=msgGen(ids,'voice',true);
                //$scope.pushMsg(m);
                toBottom(true);
                $scope.params.recording=false;
                wx.uploadVoice({
                    localId: res.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (response) {
                        console.log(response);
                        ids[0]=response.serverId;
                        // var serverId = res.serverId; // 返回图片的服务器端ID
                        sendmsg(ids,'voice');
                    }
                });
            }
        });
    }

    $scope.goChats = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if ($state.params.type == "1") $state.go('tab.doing');
        else if ($state.params.type == "0") $state.go('tab.did');
        else $state.go('tab.groups', { type: '1' });
    }
}])
//团队信息
.controller('GroupDetailCtrl', ['$scope', '$state', '$ionicModal', 'Communication','$ionicPopup','Storage','Doctor','$ionicHistory',function($scope, $state, $ionicModal,Communication,$ionicPopup,Storage,Doctor,$ionicHistory) {
    $scope.$on('$ionicView.beforeEnter', function () {

        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {

                $scope.team = data.results;
                $scope.members2 = data.results.members;
                Doctor.getDoctorInfo({ userId: $scope.team.sponsorId })
                    .then(function (data) {
                        $scope.members = $scope.members2.concat(data.results);
                    });
                if ($scope.team.sponsorId == Storage.get('UID')) $scope.ismyteam = true;
                else $scope.ismyteam = false;
            }, function (err) {
                console.log(err);
            })
    })

    $scope.addMember = function() {
        $state.go('tab.group-add-member', {teamId:$scope.team.teamId});
    }
    $scope.viewProfile = function(member){
        $state.go('tab.group-profile',{memberId:member.userId});
    }
    $scope.showQRCode = function() {
        $state.go('tab.group-qrcode', { team: $scope.team });
    }
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };
    $scope.gokick=function(){
          $state.go('tab.group-kick', { teamId: $scope.team.teamId });

    }
}])
//踢人
.controller('GroupKickCtrl', ['$scope', '$state','$ionicModal', 'Communication','$ionicPopup','Storage','CONFIG', function($scope, $state,$ionicModal,Communication,$ionicPopup,Storage,CONFIG) {
    $scope.$on('$ionicView.beforeEnter', function () {

        Communication.getTeam({ teamId: $state.params.teamId })
            .then(function (data) {
                $scope.doctors = data.results.members;
            }, function (err) {
                console.log(err);
            })
    })
    $scope.kick = function(id) {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要将此人移出团队吗?',
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                Communication.removeMember({ teamId: $state.params.teamId, membersuserId: $scope.doctors[id].userId })
                    .then(function(data) {
                        if (data.result == "更新成员成功") {
                            var idarr = [$scope.doctors[id].userId];
                            Communication.getTeam({ teamId: $state.params.teamId })
                                .then(function(data) {
                                    $scope.doctors = data.results.members;
                                }, function(err) {
                                    console.log(err);
                                });
                        }
                    }, function(err) {
                        console.log(err)
                    })
            }
        });
    }
}])
//团队二维码
.controller('GroupQrcodeCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.params = {
        team: {}
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.team = $state.params.team;
    })
}])
//添加成员
.controller('GroupAddMemberCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'CONFIG', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, CONFIG) {

    //get groupId via $state.params.groupId
    $scope.moredata = true;
    $scope.issearching = true;
    $scope.isnotsearching = false;
    $scope.group = {
        members: []
    }
    $scope.doctors = [];
    $scope.alldoctors = [];
    $scope.skipnum = 0;
    $scope.update = function(id) {
        if ($scope.doctors[id].check) $scope.group.members.push({ photoUrl: $scope.doctors[id].photoUrl, name: $scope.doctors[id].name, userId: $scope.doctors[id].userId });
        else $scope.group.members.splice(arrTool.indexOf($scope.group.members, 'userId', $scope.doctors[id].userId), 1);
    }


    $scope.loadMore = function() {
        Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');

                $scope.alldoctors = $scope.alldoctors.concat(data.results);
                $scope.doctors = $scope.alldoctors;
                $scope.nexturl = data.nexturl;
                var skiploc = data.nexturl.indexOf('skip');
                $scope.skipnum = data.nexturl.substring(skiploc + 5);
                if (data.results.length == 0) { $scope.moredata = false } else { $scope.moredata = true };
            }, function(err) {
                console.log(err);
            })
    }
    $scope.goSearch = function() {
        $scope.isnotsearching = true;
        $scope.issearching = false;
        $scope.moredata = false;
        Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function(data) {
                $scope.doctors = data.results;
                if (data.results.length == 0) {
                    $ionicLoading.show({ template: '查无此人', duration: 1000 })
                }
            }, function(err) {
                console.log(err);
            })
    }

    $scope.clearSearch = function() {
        $scope.search.name = '';
    }

    $scope.confirmAdd = function() {
        if ($state.params.type == 'new') {
            $rootScope.newMember = $rootScope.newMember.concat($scope.group.members);
            $ionicHistory.goBack();
        } else {
            $ionicLoading.show({ template: '正在更新数据' });
            Communication.insertMember({ teamId: $state.params.teamId, members: $scope.group.members })
                .then(function(data) {
                    if (data.result == "更新成员成功") {
                        $ionicLoading.show({ template: '添加成功', duration: 1000 });
                    }
                    setTimeout(function() { $ionicHistory.goBack(); }, 1000);
                }, function(err) {
                    $ionicLoading.show({ template: '添加失败', duration: 2000 });
                });
        }
    }

}])


//团队聊天
.controller('GroupChatCtrl', ['$scope', '$state', '$ionicHistory', '$ionicModal', '$ionicScrollDelegate', '$rootScope', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', 'Communication','wechat','$location','Doctor','Storage', '$q','CONFIG','arrTool','$http','New',function($scope, $state, $ionicHistory, $ionicModal, $ionicScrollDelegate, $rootScope, $ionicPopover, $ionicPopup, Camera, voice, Communication,wechat,$location,Doctor,Storage,$q,CONFIG,arrTool,$http,New) {
    $scope.input = {
        text: ''
    }
    var path = $location.absUrl().split('#')[0]
    $scope.params = {
        type: '', //'0':团队交流  '1': 未结束病历  '2':已结束病历
        groupId: '',
        teamId: '',
        team: {},
        msgCount: 0,
        title: '',
        helpDivHeight: 0,
        hidePanel: true,
        isDiscuss: false,
        isOver: false,
        moreMsgs: true,
        UID:Storage.get('UID'),
        newsType:'',
        targetName:'',
        recording:false,
        loaded:false
    }
    $rootScope.patient = {}
    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.photoUrls={};
        $rootScope.patient = {}

        $scope.msgs = [];
        $scope.params.msgCount = 0;
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        $scope.params.loaded = false;

        if ($scope.params.type == '0') {
            $scope.params.newsType='13';
            Communication.getTeam({ teamId: $scope.params.teamId })
            .then(function(data) {
                $scope.params.team = data.results;
                $scope.params.title = $scope.params.team.name + '(' + $scope.params.team.number + ')';
                $scope.params.targetName = $scope.params.team.name;
                getSponsor(data.results.sponsorId);
                for(i=0;i<data.results.members.length;i++){
                    $scope.photoUrls[data.results.members[i].userId]=data.results.members[i].photoUrl;
                }
                Doctor.getDoctorInfo({userId:data.results.sponsorId})
                .then(function(sponsor){
                    $scope.photoUrls[sponsor.results.userId]=sponsor.results.photoUrl;
                })
            });
        } else{
            getConsultation();
            $scope.params.newsType=$scope.params.teamId;
            $scope.params.title = '病历';
            $scope.params.isDiscuss = true;
        } 
    })
    $scope.$on('$ionicView.enter', function() {
            wechat.settingConfig({ url: path }).then(function(data) {
                config = data.results;
                config.jsApiList = ['startRecord','stopRecord','playVoice','chooseImage','uploadVoice', 'uploadImage']

                wx.config({
                    debug: false,
                    appId: config.appId,
                    timestamp: config.timestamp,
                    nonceStr: config.nonceStr,
                    signature: config.signature,
                    jsApiList: config.jsApiList
                })
                wx.error(function(res) {
                    console.error(res);
                    alert(res.errMsg)
                })
            });
            var loadWatcher = $scope.$watch('params.loaded', function (newv, oldv) {
                if (newv) {
                    loadWatcher();
                    if ($scope.msgs.length == 0) return;
                    var lastMsg = $scope.msgs[$scope.msgs.length - 1];
                    if (lastMsg.fromID == $scope.params.UID) return;
                    return New.insertNews({ userId: $scope.params.UID, sendBy: lastMsg.targetID, type: $scope.params.newsType, readOrNot: 1 });
                }
            });
            $rootScope.conversation.type = 'group';
            $rootScope.conversation.id = $scope.params.groupId;

            Doctor.getDoctorInfo({userId:Storage.get('UID')})
            .then(function(data){
                thisDoctor=data.results;
                socket.emit('newUser',{user_name:thisDoctor.name,user_id:$scope.params.UID,client:'wechatdoctor'});
                socket.on('err',function(data){
                    console.error(data)
                });
                socket.on('getMsg',function(data){
                    console.info('getMsg');
                    console.log(data);
                    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
                        $scope.$apply(function(){
                            insertMsg(data.msg);
                        });
                        New.insertNews({userId:$scope.params.UID,sendBy:$scope.params.groupId,type:$scope.params.newsType,readOrNot:1});
                    }
                });
                socket.on('messageRes',function(data){
                    console.info('messageRes');
                    console.log(data);
                    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
                        $scope.$apply(function(){
                            insertMsg(data.msg);
                        })
                    }
                });
            });
            $scope.getMsg(15).then(function(data){
                $scope.msgs=data;
                toBottom(true,400);
                $scope.params.loaded = true;
            });
            imgModalInit();
        })

    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height;
        toBottom(true,100);
    })
    $scope.$on('keyboardhide', function(event) {
        $scope.params.helpDivHeight = 0;
    })
    $scope.$on('$ionicView.beforeLeave', function() {
        socket.off('messageRes');
        socket.off('getMsg');
        socket.off('err');
        socket.emit('disconnect');
        if ($scope.popover) $scope.popover.hide();
    })
    $scope.$on('$ionicView.leave', function() {
        $scope.msgs = [];
        if ($scope.modal) $scope.modal.remove();
        $rootScope.conversation.type = null;
        $rootScope.conversation.id = '';
        if (window.JMessage) window.JMessage.exitConversation();
    })
    function getConsultation(){
        Communication.getConsultation({ consultationId: $scope.params.groupId })
        .then(function(data) {
            $scope.viewChat = viewChatFn(data.result.sponsorId.userId,data.result.patientId.userId);
            $scope.params.title+= '-'+data.result.patientId.name;
            $rootScope.patient = data.result;
            $scope.params.type = data.result.status;
            if($scope.params.type==1){
                $scope.params.hidePanel = true;
            }else{
                $scope.params.hidePanel = false;
                $rootScope.patient.undergo = false;
                $scope.params.isOver = true;
            }
            Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function(res) {
                    $scope.params.team = res.results;
                    $scope.params.targetName = '['+data.result.patientId.name+']'+$scope.params.team.name;
                    getSponsor(res.results.sponsorId);
                    for(i=0;i<res.results.members.length;i++){
                        $scope.photoUrls[res.results.members[i].userId]=res.results.members[i].photoUrl;
                    }
                });
        });
    }
    function viewChatFn(DID,PID){
        return function(){
            $state.go('tab.view-chat',{doctorId:DID,patientId:PID});
        }
    }
    function getSponsor(id){
        Doctor.getDoctorInfo({userId:id})
            .then(function(sponsor){
                $scope.photoUrls[sponsor.results.userId]=sponsor.results.photoUrl;
            });
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }
    $scope.scrollBottom = function() {
        $scope.showVoice = false;
        $scope.showMore = false;
        toBottom(true);
    }
    // $scope.scrollBottom = function() {
    //     $scope.scrollHandle.scrollBottom(true);
    // }
    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.getMsg = function(num) {
        console.log('getMsg:' + num);
        return $q(function(resolve,reject){
            var q={
                messageType:'2',
                id2:$scope.params.groupId,
                skip:$scope.params.msgCount,
                limit:num
            }
            Communication.getCommunication(q)
            .then(function(data){
                console.log(data);
                var d=data.results;
                $scope.$broadcast('scroll.refreshComplete');
                if(d=='没有更多了!') return noMore();
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                        // $scope.msgs[0].diff = true;
                    // });
                }
                console.log($scope.msgs);
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            });
        })
    }

    $scope.togglePanel = function() {
        $scope.params.hidePanel = !$scope.params.hidePanel;
    }
    $scope.viewGroup = function(){
        $state.go('tab.group-detail',{teamId:$scope.params.teamId});
    }
        //长按工具条
    // var options = [{
    //     name: '转发医生',
    // }, {
    //     name: '转发团队',
    // }]
    // $ionicPopover.fromTemplateUrl('partials/others/toolbox-pop.html', {
    //     scope: $scope,
    // }).then(function(popover) {
    //     $scope.options = options;
    //     $scope.popover = popover;
    // });
     $scope.$on('holdmsg', function(event, args) {
        console.log(args)
        event.stopPropagation();

        // $scope.popover.show(args[2]);
    })
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            // $scope.modal.show();
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
        // $scope.modal.remove()
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    }

    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.params.audio=args[1];
        wx.downloadVoice({
            serverId: args[1].mediaId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
            isShowProgressTips: 0, // 默认为1，显示进度提示
            success: function (res) {
                // var localId = res.localId; // 返回音频的本地ID
                wx.playVoice({
                    localId: res.localId// 需要播放的音频的本地ID，由stopRecord接口获得
                });
            }
        });

    })

    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb);
        $scope.modal.show();
    })
    $scope.$on('profile', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $state.go('tab.group-profile', { memberId: args[1].fromID });
    })
    $scope.$on('viewcard', function(event, args) {
        console.log(args[1]);
        event.stopPropagation();

        if($scope.params.type=='0'){
            Communication.getConsultation({ consultationId: args[1].content.consultationId})
                .then(function(data) {
                    var ctype = data.result.status;
                    if(ctype=='0') ctype='2';
                    $state.go('tab.group-chat',{'type':ctype,'teamId':$scope.params.teamId,'groupId':args[1].content.consultationId});
                })
        }
    })

    $scope.toolChoose = function(data) {
        if (data == 0) $state.go('tab.selectDoc');
        if (data == 1) $state.go('tab.selectTeam');
    }
    $scope.viewPic = function(src) {
        $scope.imageUrl = src;
        $scope.modal.show();
    }
    $scope.viewPatient = function(pid){
        Storage.set('getpatientId',pid);
        var statep={
            type:$scope.params.type,
            groupId:$scope.params.groupId,
            teamId:$scope.params.teamId
        }
        Storage.set('backId','tab.group-chat');
        Storage.set('groupChatParams',JSON.stringify(statep));
        $state.go('tab.patientDetail');

    }
    $scope.updateMsg = function(msg){
        console.info('updateMsg');
        
            if(msg.contentType=='image') msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            // msg.diff=$scope.msgs[pos].diff;
            msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
            if (pos == 0) {
                msg.diff = true;
            }else if(msg.hasOwnProperty('time') && $scope.msgs[pos-1].hasOwnProperty('time')){
                msg.diff = (msg.time - $scope.msgs[pos-1].time) > 300000 ? true : false;
            }
            $scope.msgs[pos]=msg;
    }
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        if(msg.hasOwnProperty('time')){
            if(len==0){
                msg.diff=true;
            }else{
                var m = $scope.msgs[len-1];
                if(m.hasOwnProperty('time')){
                    msg.diff=(msg.time - m.time) > 300000 ? true : false;
                }
            }
        }
        msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        if(msg.contentType=='image') {
            msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            $http.get(msg.content.thumb).then(function(data){
                $scope.msgs.push(msg);
                toBottom(true,400);
                toBottom(true,800);
                $scope.params.msgCount++;
            })
        }else{
            $scope.msgs.push(msg);
            toBottom(true,100);
            $scope.params.msgCount++;
        }
    }
    function insertMsg(msg){
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos==-1){
            $scope.pushMsg(msg);
        }else{
            $scope.updateMsg(msg,pos);
        }
    }
    function sendmsg(content,type){
        var data={};
        if(type=='text'){
            data={
                text:content
            };
        }else if(type=='image'){
            data={
                mediaId:content[0],
                mediaId_thumb:content[1],
                src:'',
                src_thumb:''
            };
        }else if(type=='voice'){
            data={
                mediaId:content,
                src:''
            };
        }
        var msgJson={
            clientType:'wechatdoctor',
            contentType:type,
            fromID:$scope.params.UID,
            fromName:thisDoctor.name,
            fromUser:{
                avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+$scope.params.UID+'_myAvatar.jpg'
            },
            targetID:$scope.params.groupId,
            teamId:$scope.params.teamId,
            targetName:$scope.params.targetName,
            targetType:'group',
            status:'send_going',
            createTimeInMillis: Date.now(),
            newsType:$scope.params.newsType,
            targetRole:'doctor',
            content:data
        }
        console.info('socket.connected'+socket.connected);
        console.log(msgJson);
        socket.emit('message',{msg:msgJson,to:$scope.params.groupId,role:'doctor'});
    }
    function onSendSuccess(res) {
        console.log(res);
        viewUpdate(10);
    }

    function onSendErr(err) {
        console.log(err);
        alert('[send msg]:err');
        viewUpdate(20);
    }
    $scope.submitMsg = function() {
        sendmsg($scope.input.text,'text');
        $scope.input.text = '';
    }

    //get image
    $scope.getImage = function(type) {
        $scope.showMore = false;
        var ids=['',''];
        if(type=='cam') var st=['camera'];
        else var st = ['album'];
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: st, // 可以指定来源是相册还是相机，默认二者都有
            success: function (response) {
                console.log(response);
                ids=ids.concat(response.localIds);
                wx.uploadImage({
                    localId: response.localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (res) {
                        console.log(res);
                        ids[0]=res.serverId; // 返回图片的服务器端ID
                        sendmsg(ids,'image');
                    }
                });
                // wx.uploadImage({
                //     localId: response.localIds[1], // 需要上传的图片的本地ID，由chooseImage接口获得
                //     isShowProgressTips: 0, // 默认为1，显示进度提示
                //     success: function (res) {
                //         console.log(res);
                //         ids[1]=res.serverId; // 返回图片的服务器端ID
                //         if(count) sendmsg(ids,'image');
                //         else count++;
                //         // sendmsg(serverId,'image');
                //     }
                // });
            }
        });
    }

    //get voice

    $scope.getVoice = function(){
        wx.startRecord();
        $scope.params.recording=true;
    }
    $scope.stopAndSend = function() {
        wx.stopRecord({
            success: function (res) {
                var ids=['',res.localId];
                var m=msgGen(ids,'voice',true);
                $scope.pushMsg(m);
                $scope.params.recording=false;
                toBottom(true);
                wx.uploadVoice({
                    localId: res.localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 0, // 默认为1，显示进度提示
                    success: function (response) {
                        console.log(response);
                        ids[0]=response.serverId;
                        // var serverId = res.serverId; // 返回图片的服务器端ID
                        sendmsg(ids,'voice');
                    }
                });
            }
        });
    }
    $scope.goChats = function() {
        console.log($ionicHistory);
        console.log($scope.params);

        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if ($scope.params.type == '0') $state.go('tab.groups', { type: '0' });
        else $state.go('tab.group-patient', { teamId: $scope.params.teamId });
    }
    $scope.goConclusion =function(){
        $state.go('tab.group-conclusion',{groupId:$scope.params.groupId,teamId:$scope.params.teamId});
    }
}])
//病历结论
.controller('GroupConclusionCtrl',['$state','$scope','$ionicModal','$ionicScrollDelegate','Communication','$ionicLoading','CONFIG','Account','Counsel',function($state,$scope,$ionicModal,$ionicScrollDelegate,Communication,$ionicLoading,CONFIG,Account,Counsel){
    $scope.input = {
        text: ''
    }
    $scope.params = {
        type: '',
        groupId: '',
        teamId: ''
    }

    $scope.patient = {}
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.input.text='';
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        Communication.getConsultation({ consultationId: $scope.params.groupId })
            .then(function(data) {
                $scope.patient = data.result;
            })
    })

    $scope.save = function() {
        Communication.conclusion({ consultationId: $state.params.groupId, conclusion: $scope.input.text})
            .then(function(data) {
                Communication.getCounselReport({ counselId: $scope.patient.diseaseInfo.counselId })
                    .then(function(res) {
                        var DID=res.results.doctorId.userId,PID=res.results.patientId.userId;
                        var msgJson = {
                            clientType:'wechatdoctor',
                            contentType: 'text',
                            fromID: DID,
                            fromName:res.results.doctorId.name,
                            fromUser: {
                                avatarPath: CONFIG.mediaUrl + 'uploads/photos/resized' + DID + '_myAvatar.jpg'
                            },
                            targetID: PID,
                            targetName: res.results.patientId.name,
                            targetType: 'single',
                            status: 'send_going',
                            newsType:'11',
                            targetRole:'patient',
                            createTimeInMillis: Date.now(),
                            content: {
                                text: $scope.input.text

                            }
                        }
                        if(res.results.type!='1'){
                            socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID ,client:'wechatdoctor'});
                            socket.emit('message', { msg: msgJson, to: PID ,role:'doctor'});
                            // socket.on('messageRes', function(data) {
                            // socket.off('messageRes');
                            socket.emit('disconnect');
                            $ionicLoading.show({ template: '回复成功', duration: 1500 });
                            setTimeout(function() {
                                $state.go('tab.groups', { type: '0' });
                            }, 1500);
                        }else{
                            Account.modifyCounts({doctorId:DID,patientId:PID,modify:'-1'})
                            .then(function(){
                                Account.getCounts({doctorId:DID,patientId:PID})
                                .then(function(response){
                                    socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID ,client:'wechatdoctor'});
                                    socket.emit('message', { msg: msgJson, to: PID ,role:'doctor'});
                                    
                                    if(response.result.count<=0){
                                        var endlMsg={
                                            type:'endl',
                                            info:"咨询已结束",
                                            docId:DID,
                                            counseltype:1
                                        }
                                        var endJson={
                                            clientType:'wechatdoctor',
                                            contentType:'custom',
                                            fromID:DID,
                                            fromName:res.results.doctorId.name,
                                            fromUser:{
                                                avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+DID+'_myAvatar.jpg'
                                            },
                                            targetID:PID,
                                            targetName:res.results.patientId.name,
                                            targetType:'single',
                                            status:'send_going',
                                            createTimeInMillis: Date.now(),
                                            targetRole:'patient',
                                            newsType:'11',
                                            content:endlMsg
                                        }
                                        socket.emit('message', { msg: endJson, to: PID ,role:'doctor'});
                                        Counsel.changeCounselStatus({counselId:res.results.counselId,status:0})
                                    }
                                    socket.emit('disconnect');
                                    $ionicLoading.show({ template: '回复成功'});
                                    setTimeout(function() {
                                        $ionicLoading.hide();
                                        $state.go('tab.groups', { type: '0' });
                                    }, 1000);

                                });

                            });
                        }
                    });

            }, function(err) {
                console.log(err);
            })
    }

    $scope.$on('$ionicView.leave', function() {
        if ($scope.modal) $scope.modal.remove();
    })
}])
.controller('selectDocCtrl', ['$state', '$scope', 'JM', '$ionicPopup','$ionicLoading','$ionicScrollDelegate','Patient', 'Storage','CONFIG','wechat', function($state, $scope, JM, $ionicPopup,$ionicLoading,$ionicScrollDelegate,Patient, Storage,CONFIG,wechat) {
    $scope.params={
        moredata:true,
        skip:0,
        limit:20,
        query:'',
        isSearch:false,
        preKey:''
    }
    var allDoctors=[];
    $scope.doctors=[];
    $scope.$on('$ionicView.beforeEnter',function(){
        $ionicScrollDelegate.scrollTop();
        $scope.params.query='';
        $scope.params.isSearch=false;
    })

    $scope.listenenter = function(){

    }
    $scope.loadMore = function() {
        Patient.getDoctorLists({ skip: $scope.params.skip, limit: $scope.params.limit })
            .then(function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                allDoctors = $scope.doctors.concat(data.results);
                $scope.doctors = allDoctors;
                $scope.params.skip+=data.results.length;
                if (data.results.length <$scope.params.limit)
                    $scope.moredata = false;
            }, function(err) {
                console.log(err);
            })
    }

    $scope.$watch('params.query',function(val,val1){
        if($scope.params.query==''){
            $scope.doctors=allDoctors;
            $scope.params.isSearch=false;
            // angular.element('#searchBox').focus();
        }
    })
    $scope.docSearch = function(){
        if(!$scope.params.isSearch){
             $ionicLoading.show();
            Patient.getDoctorLists({ skip: 0, limit: 100, name: $scope.params.query })
            .then(function(data){
                if (data.results.length == 0) {
                        $ionicLoading.show({ template: '结果为空', duration: 1000 });
                    }else{
                        $ionicLoading.hide();
                        allDoctors=$scope.doctors;
                        $scope.doctors = data.results;
                        $scope.params.isSearch=true;
                    }
            }, function(err) {
                    console.log(err);
                })
        }else{
            $scope.doctors = allDoctors;
            $scope.params.query='';

        }
    }
    $scope.sendTo = function(doc) {
        var confirmPopup = $ionicPopup.confirm({
            title: '转发给：' + doc.name,
            // template: '确定要结束此次咨询吗?'
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                var msgdata = $state.params.msg;
                msgdata.fromId = thisDoctor.userId;
                msgdata.targetId = doc.userId;
                var msgJson={
                    clientType:'wechatdoctor',
                    contentType:'custom',
                    fromID:thisDoctor.userId,
                    fromName:thisDoctor.name,
                    fromUser:{
                        avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                    },
                    targetID:doc.userId,
                    targetName:doc.name,
                    targetType:'single',
                    status:'send_going',
                    createTimeInMillis: Date.now(),
                    newsType:'12',
                    targetRole:'doctor',
                    content:msgdata
                }
                socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId,client:'wechatdoctor'});
                socket.emit('message',{msg:msgJson,to:doc.userId,role:'doctor'});
                socket.on('messageRes',function(messageRes){
                    if(messageRes.msg.createTimeInMillis!=msgJson.createTimeInMillis) return;
                    var csl = messageRes.msg.content.counsel;
                    socket.off('messageRes');
                    socket.emit('disconnect');
                    var actionUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab9c316b3076535d&redirect_uri=http://proxy.haihonghospitalmanagement.com/go&response_type=code&scope=snsapi_userinfo&state=doctor_12_2_'+Storage.get('UID')+'_doctor'+ '&#wechat_redirect';
                    var template = {
                        "userId": doc.userId, //医生的UID
                        "role": "doctor",
                        "postdata": {
                            "template_id": "cVLIgOb_JvtFGQUA2KvwAmbT5B3ZB79cRsAM4ZKKK0k",
                            "url":actionUrl,
                            "data": {
                                "first": {
                                    "value": thisDoctor.name+"向您转发了一个"+(csl.type==1?'咨询':'问诊')+"消息，请及时查看",
                                    "color": "#173177"
                                },
                                "keyword1": {
                                    "value": csl.counselId, //咨询ID
                                    "color": "#173177"
                                },
                                "keyword2": {
                                    "value": doc.name, //患者信息（姓名，性别，年龄）
                                    "color": "#173177"
                                },
                                "keyword3": {
                                    "value": csl.help, //问题描述
                                    "color": "#173177"
                                },
                                "keyword4": {
                                    "value": csl.time.substr(0,10), //提交时间
                                    "color": "#173177"
                                },

                                "remark": {
                                    "value": "感谢您的使用！",
                                    "color": "#173177"
                                }
                            }
                        }
                    }
                    wechat.messageTemplate(template);
                    $state.go('tab.detail', { type: '2', chatId: doc.userId,counselId:msgdata.counselId});
                })

            }
        });
    }
}])
.controller('selectTeamCtrl', ['$state', '$scope', '$ionicPopup', 'Doctor', 'Communication', 'Storage','CONFIG','$filter', function($state, $scope, $ionicPopup, Doctor, Communication, Storage,CONFIG,$filter) {
    $scope.query={
        name:'',
    }
    Doctor.getMyGroupList({ userId: Storage.get('UID') })
        .then(function(data) {
            $scope.teams = data;
        }, function(err) {
            console.log(err);
        });

    $scope.sendTo = function(team) {
            var confirmPopup = $ionicPopup.confirm({
                title: '转发给：' + team.name,
                // template: ''
                okText: '确定',
                cancelText: '取消'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    var time = new Date();
                    var gid='G'+$filter('date')(time, 'MMddHmsss');
                    var gid;
                    var msgdata = $state.params.msg;

                    var d = {
                        teamId: team.teamId,
                        counselId: msgdata.counselId,
                        sponsorId: msgdata.doctorId,
                        patientId: msgdata.patientId,
                        consultationId: gid,
                        status: '1'
                    };
                    msgdata.consultationId=gid;
                    msgdata.targetId=team.teamId;
                    msgdata.fromId=thisDoctor.userId;
                    var msgJson={
                        clientType:'wechatdoctor',
                        contentType:'custom',
                        fromID:thisDoctor.userId,
                        fromName:thisDoctor.name,
                        fromUser:{
                            avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                        },
                        targetID:team.teamId,
                        teamId:team.teamId,
                        targetName:team.name,
                        targetType:'group',
                        status:'send_going',
                        newsType:'13',
                        targetRole:'doctor',
                        createTimeInMillis: Date.now(),
                        content:msgdata
                    };

                    Communication.newConsultation(d)
                    .then(function(data){
                        socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId,client:'wechatdoctor'});
                        socket.emit('message',{msg:msgJson,to:team.teamId,role:'doctor'});
                        socket.on('messageRes',function(messageRes){
                            if(messageRes.msg.createTimeInMillis!=msgJson.createTimeInMillis) return;
                            socket.off('messageRes');
                            socket.emit('disconnect');
                            $state.go('tab.group-chat', { type: '0', groupId:team.teamId, teamId: team.teamId });
                        });
                    },function(er){
                        console.error(err);
                    });
                }
            });
        }
}])
.controller('doctorProfileCtrl',['$scope','$state','Doctor','Storage','$ionicHistory',function($scope,$state,Doctor,Storage,$ionicHistory){
    $scope.goBack = function(){
        $ionicHistory.goBack();
    }
    $scope.doctor={};
    $scope.goChat = function(){
        $state.go('tab.detail',{type:'2',chatId:$state.params.memberId});
    }
    $scope.$on('$ionicView.beforeEnter', function () {
        if ($state.params.memberId == Storage.get('UID')) $scope.isme = true;
        else $scope.isme = false;

        Doctor.getDoctorInfo({ userId: $state.params.memberId })
            .then(function (data) {
                $scope.doctor = data.results;
            });
    })
}])
.controller('viewChatCtrl',['$scope', '$state', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', 'voice', 'CONFIG', 'Communication','Doctor','Patient','$q','Storage',function($scope, $state, $ionicModal, $ionicScrollDelegate, $ionicHistory, voice, CONFIG, Communication,Doctor,Patient,$q,Storage){

    $scope.photoUrls={}
    $scope.params = {
        msgCount: 0,
        moreMsgs: true,
        chatId:'',
        doctorId: '',
        counsel: {},
        patientName:''
    }

    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs 
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.photoUrls = {};
        $scope.msgs = [];
        $scope.params.chatId = $state.params.patientId;
        $scope.params.doctorId = $state.params.doctorId;
        Storage.set('chatSender',$scope.params.doctorId);
        $scope.params.msgCount = 0;
        //获取counsel信息
        Patient.getPatientDetail({ userId: $scope.params.chatId })
            .then(function (data) {
                if(data.results.name) $scope.params.patientName = '-'+data.results.name;
                $scope.photoUrls[data.results.userId] = data.results.photoUrl;
            });
        Doctor.getDoctorInfo({ userId: $scope.params.doctorId })
            .then(function(response) {
                $scope.photoUrls[response.results.userId] = response.results.photoUrl;
            }, function(err) {
                console.log(err);
            })

        $scope.getMsg(15).then(function (data) {
            $scope.msgs = data;
            toBottom(true, 400);
        });
    });


    $scope.$on('$ionicView.enter', function() {
        imgModalInit();
    })

    $scope.$on('$ionicView.beforeLeave', function() {
        Storage.rm('chatSender');
        if ($scope.modal) $scope.modal.remove();
        if ($scope.popover) $scope.popover.hide();
    });
    $scope.$on('$ionicView.leave', function() {
        $scope.msgs = [];
    });

    $scope.getMsg = function(num) {
        console.info('getMsg');
        return $q(function(resolve,reject){
            var q={
                messageType:'1',
                newsType:'11',
                id1:$scope.params.doctorId,
                id2:$scope.params.chatId,
                skip:$scope.params.msgCount,
                limit:num
            }
            Communication.getCommunication(q)
            .then(function(data){
                var d=data.results;
                $scope.$broadcast('scroll.refreshComplete');
                if(d=='没有更多了!') return noMore();
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0 ) $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].time - res[0].time) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.doctorId?'send':'receive';
                            res[i].diff = (res[i].time - res[i + 1].time) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.doctorId?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
                    // });
                }
                resolve($scope.msgs);
            },function(err){
                $scope.$broadcast('scroll.refreshComplete');
                resolve($scope.msgs);
            });
        })

    }

    function noMore(){
        $scope.params.moreMsgs = false;
        setTimeout(function(){
            $scope.$apply(function(){
                $scope.params.moreMsgs = true;
            });
        },5000);
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }

    $scope.scrollBottom = function() {
        $scope.showVoice = false;
        $scope.showMore = false;
        $scope.scrollHandle.scrollBottom(true);
    }
    
    //view image
    function imgModalInit() {
        $scope.zoomMin = 1;
        $scope.imageUrl = '';
        $scope.sound = {};
        $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
        });
    }

    $scope.$on('image', function(event, args) {
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = args[2].localPath || (CONFIG.mediaUrl + (args[2].src|| args[2].src_thumb));
        $scope.modal.show();
    });

    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(5, true);
        }
    };
    $scope.$on('voice', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.sound = new Media(args[1],
            function() {
            },
            function(err) {
                console.log(err);
            })
        $scope.sound.play();
    });

    $scope.$on('holdmsg', function(event, args) {
        event.stopPropagation();
    });
    $scope.$on('viewcard', function(event, args) {
        event.stopPropagation();
    });
    
    $scope.$on('profile', function(event, args) {
        event.stopPropagation();
    });

    $scope.goBack = function() {
        $ionicHistory.goBack();
    }
}])