angular.module('xjz.controllers', ['ionic', 'kidney.services'])
//新建团队
.controller('NewGroupCtrl', ['$scope', '$state', '$ionicLoading', '$rootScope', 'Communication', 'Storage', 'JM', 'Doctor','$filter', function($scope, $state, $ionicLoading, $rootScope, Communication, Storage, JM, Doctor,$filter) {
    $rootScope.newMember = [];
    // $scope.group = {
    //     members: [
    //     ]
    // }
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
        console.log($rootScope.newMember);
       // return;
        if($scope.team.name=='' || $scope.team.description==''){
            $ionicLoading.show({ template: '请完整填写信息', duration: 1500 });
        }else if(!$scope.members){
            $ionicLoading.show({ template: '请至少添加一个成员', duration: 1500 });
        }else{  
            upload();
            // var idStr='';
            //         for(i=0;i<$rootScope.newMember.length;i++){
            //              window.JMessage.register($rootScope.newMember[i].userId, JM.pGen($rootScope.newMember[i].userId),function(data){
            //                 console.log(data);
            //              },function(err){
            //                 console.log(err);
            //              });
            //             if(i==0){
            //             idStr=$rootScope.newMember[i].userId}
            //             else{idStr=idStr+','+$rootScope.newMember[i].userId}
            //         }
                    
       
            //          console.log(idStr);
            // setTimeout(function(){ 
            //      window.JMessage.createGroup($scope.team.name,$scope.team.description,idStr,
            //     function(data){
            //         console.log(data);
            //         upload(data);
            //         // members=$rootScope.newMember;
                    
            //         // window.JMessage.addGroupMembers(groupId,idStr,
            //         // window.JMessage.addGroupMembers('22818577','user004',
            //         //     function(data){
            //         //         console.log(data);
            //         //         upload();
            //         //     },function(err){
            //         //         $ionicLoading.show({ template: '失败addGroupMembers', duration: 1500 });
            //         //         console.log(err);
            //         //     })
            //     },function(err){
            //         $ionicLoading.show({ template: '失败createGroup', duration: 1500 });
            //         console.log(err);
            //     })
            // },500); 
            // JM.newGroup($scope.team.name,$scope.team.description,$scope.members)
            // .then(function(data){
            //     console.log(data);
            //     upLoad();
            // },function(err){
            //     $ionicLoading.show({ template: '失败createGroup', duration: 1500 });
            // })
            // window.JMessage.createGroup($scope.team.name,$scope.team.description,
            //     function(data){
            //         console.log(data);
            //         // members=$rootScope.newMember;
            //         var idStr=[];
            //         for(var i in members) idStr.push(members[i].userId);
            //         idStr.join(',');
            //         window.JMessage.addGroupMembers($scope.team.name,idStr,
            //             function(data){
            //                 console.log(data);
            //                 upload();
            //             },function(err){
            //                 $ionicLoading.show({ template: '失败addGroupMembers', duration: 1500 });
            //                 console.log(err);
            //             })
            //     },function(err){
            //         $ionicLoading.show({ template: '失败createGroup', duration: 1500 });
            //         console.log(err);
            //     })
        }
    }

    function upload(){
        var time = new Date();
        $scope.team.teamId='G'+$filter('date')(time, 'MMddHmsss');
        $scope.team.sponsorId=Storage.get('UID');
        Doctor.getDoctorInfo({userId:$scope.team.sponsorId})
        .then(function(data){
            $scope.team.sponsorName=data.results.name;
            Communication.newTeam($scope.team)
            .then(function(data){
                //add members
            
                    Communication.insertMember({teamId:$scope.team.teamId,members:$rootScope.newMember})
                    .then(function(data){
                      console.log(data)
                    },function(err){
                        console.log(err);
                    })
                
                $ionicLoading.show({ template: '创建成功', duration: 1500 });
                setTimeout(function(){
                    $state.go('tab.groups',{type:'0'});
                },1500);
            },function(err){
                $ionicLoading.show({ template: '失败newTeam', duration: 1500 });
                console.log(err);
            })
        })
    }
    // function onCreateOK(data){
    //     console.log(data);
    //     var idStr='';
    //     for(var i in members) idStr+=members[i].userId+',';
    //     idStr=idStr.slice(0, -1);
    //     $scope.team.teamId=data.gid;
    //     $scope.team.sponsorId=Storage.get('UID');
    //     $scope.team.sponsorName=Storage.get('USERNAME');

    //     communication.newTeam($scope.team)
    //     .then(function(data){
    //         for(var i in members){
    //             communication.insertMember({teamId:$scope.team.teamId,membersuserId:members[i].userId,membersname:members[i].name})
    //             .then(function(data){

    $scope.addMember = function() {
        $state.go('tab.group-add-member', { type: 'new' });
    }
}])
//团队查找

.controller('GroupsSearchCtrl', ['$scope', '$state','Communication', function($scope, $state,Communication) {
    $scope.search='';
    $scope.noteam=0;
  $scope.Searchgroup=function(){
    console.log($scope.search)
     Communication.getTeam({teamId:$scope.search})
                .then(function(data){
                  console.log(data)                 
                  $scope.teamresult=data;
                  if(data.length==0){
                    $ionicLoading.show({ template: '查无此群', duration: 1000 })}       
                },function(err){
                    console.log(err);
                })
  }
    $scope.clearSearch=function(){
        $scope.search='';
     }    

}])
//医生查找
.controller('DoctorSearchCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'JM', 'CONFIG', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, JM, CONFIG) {

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
    $scope.loadMore = function() {
        // $scope.$apply(function() {
        Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function(data) {
                console.log(data.results)
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
            // });
    }
    $scope.goSearch = function() {
        $scope.isnotsearching = true;
        $scope.issearching = false;
        $scope.moredata = false;
        Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function(data) {
                console.log(data.results)
                $scope.doctors = data.results;
                if (data.results.length == 0) {
                    console.log("aaa")
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
        $scope.search.name = '';
    }
    $scope.clearSearch = function() {
        $scope.search.name = '';
    }
    $scope.doctorClick = function(doc) {
        console.log(doc)
        $state.go('tab.detail', { type: '2', chatId:doc });
    }
}])
//我的团队
.controller('groupsCtrl', ['$scope', '$http', '$state', '$ionicPopover', 'Doctor', 'Storage', 'Patient','arrTool','$q','wechat','$location','New', function($scope, $http, $state, $ionicPopover, Doctor, Storage, Patient,arrTool,$q,wechat,$location,New) {
    // $scope.teams=[];
    // $scope.doctors=[];
    $scope.query = {
        name: ''
    }
    $scope.params = {
        isTeam: true,
        showSearch: false,
        updateTime: 0
    }

    function msgNoteGen(msg){
        var fromName='',note='';
        if(msg.targetType=='group') fromName=msg.fromName+ ':';
        
        if(msg.contentType=='text'){
            note=msg.content.text;
        }else if(msg.contentType=='image'){
            note='[图片]';
        }else if(msg.contentType=='voice'){
            note='[语音]';
        }else if(msg.contentType=='custom'){
            if(msg.content.contentStringMap.type='card') note='[患者病历]';
            else if(msg.content.contentStringMap.type='contact') note='[联系人名片]';
        }
        return fromName +note;
    }
    function setSingleUnread(doctors){
        return $q(function(resolve,reject){
            if(window.JMessage){
                window.JMessage.getAllSingleConversation(
                function(data){
                    if(data!=''){
                        var conversations = JSON.parse(data);
                        for(var i in doctors){
                            var index=arrTool.indexOf(conversations,'targetId',doctors[i].doctorId.userId);
                            if(index!=-1){
                                doctors[i].unRead=conversations[index].unReadMsgCnt;
                                doctors[i].latestMsg = msgNoteGen(conversations[index].latestMessage);
                                doctors[i].lastMsgDate = conversations[index].lastMsgDate;
                            }
                        }
                    }
                    resolve(doctors);
                },function(err){
                    $scope.doctors = doctors;
                    resolve(doctors);
                });
            }else{
                resolve(doctors);
            }
        });
    }
    function setGroupUnread(teams){
        return $q(function(resolve,reject){
            if(window.JMessage){
                window.JMessage.getAllGroupConversation(
                function(data){
                    if(data!=''){
                       var conversations = JSON.parse(data);
                        for(var i in teams){
                            var index=arrTool.indexOf(conversations,'targetId',teams[i].teamId);
                            if(index!=-1) {
                                teams[i].unRead=conversations[index].unReadMsgCnt;
                                teams[i].latestMsg = msgNoteGen(conversations[index].latestMessage);
                                teams[i].lastMsgDate = conversations[index].lastMsgDate;
                            }
                        } 
                    }
                    resolve(teams);
                },function(err){
                    resolve(teams);
                });
            }else{
                resolve(teams);
            }
        });
    }
    $scope.load = function(force) {
        var time = Date.now();
        if (!force && time - $scope.params.updateTime < 60000){
            setGroupUnread($scope.teams)
            .then(function(teams){
                $scope.teams=teams;
            });
            setSingleUnread($scope.doctors)
            .then(function(doctors){
                $scope.doctors=doctors;
            });
        }else{
            $scope.params.updateTime = time;
            Doctor.getMyGroupList({ userId: Storage.get('UID') })
                .then(function(data) {
                    console.log(data);
                    New.addNews('13',Storage.get('UID'),data,'teamId')
                    .then(function(teams){
                        $scope.teams=teams;
                    })
                    // setGroupUnread(data)
                    // .then(function(teams){
                    //     $scope.teams=teams;
                    // });
                });
            Doctor.getRecentDoctorList({ userId: Storage.get('UID') })
                .then(function(data) {
                    console.log(data);
                    New.addNestNews('12',Storage.get('UID'),data.results,'userId','doctorId')
                    .then(function(doctors){
                        $scope.doctors=doctors;
                    })
                    // setSingleUnread(data.results)
                    // .then(function(doctors){
                    //     $scope.doctors=doctors;
                    // });
                }, function(err) {
                    console.log(err)
                });
        }
    }

    $scope.$on('$ionicView.beforeEnter', function() {
        //type:   '0'=team  '1'=doctor
        $scope.params.isTeam = $state.params.type == '0';
        $scope.params.showSearch = false;
    })
    // $scope.$on('receiveMessage',function(event, msg) {
        // $scope.load();
    // });
    $scope.$on('$ionicView.enter', function() {
        $scope.load(true);
        // wechat.settingConfig({ url: $location.absUrl() }).then(function(data) {
        //     // alert(data.results.timestamp)
        //     config = data.results;
        //     config.jsApiList = ['chooseImage', 'uploadImage']
        //         // alert(config.jsApiList)
        //         // alert(config.debug)
        //     wx.config({
        //         debug: true,
        //         appId: config.appId,
        //         timestamp: config.timestamp,
        //         nonceStr: config.nonceStr,
        //         signature: config.signature,
        //         jsApiList: config.jsApiList
        //     })
            // wx.ready(function() {
            //     wx.checkJsApi({
            //         jsApiList: ['chooseImage', 'uploadImage'],
            //         success: function(res) {
            //             wx.chooseImage({
            //                 count: 1,
            //                 sizeType: ['original', 'compressed'],
            //                 sourceType: ['album'],
            //                 success: function(res) {
            //                     var localIds = res.localIds;
            //                     wx.uploadImage({
            //                         localId: localIds[0],
            //                         isShowProgressTips: 1, // 默认为1，显示进度提示
            //                         success: function(res) {
            //                             var serverId = res.serverId; // 返回图片的服务器端ID
            //                             wechat.
            //                         }
            //                     })
            //                 }
            //             })
            //         }
            //     });
            // })
        //     wx.error(function(res) {
        //         console.error(res);
        //         alert(res.errMsg)
        //     })
        // });

    })
    $scope.doRefresh = function(){
        $scope.load();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    } 
    $scope.showTeams = function() {
        $scope.params.isTeam = true;
    }
    $scope.showDocs = function() {
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

    // $scope.team1 = [{
    //     photoUrl: "img/avatar.png",
    //     teamId: "22825679",
    //     name: "肾病管理团队",
    //     workUnit: "浙江XXX医院",
    //     sponsorName: '陈有维',
    //     major: "肾上腺分泌失调",
    //     number: 31
    // }, {
    //     photoUrl: "img/avatar.png",
    //     teamId: "22825863",
    //     name: "肾病小组测试",
    //     sponsorName: '陈有维',
    //     workUnit: "浙江XXX医院",
    //     major: "慢性肾炎、肾小管疾病",
    //     number: 12
    // }];

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
    $scope.doctorst = [{
        photoUrl: "img/avatar.png",
        userId: "U201702070041",
        name: "陈有维",
        gender: "男",
        title: "主任医生",
        workUnit: "浙江XXX医院",
        department: "泌尿科",
        major: "肾上腺分泌失调",
        score: '9.5',
        num: 2313
    }, {
        photoUrl: "img/max.png",
        userId: "U201612300431",
        name: "叶青",
        gender: "女",
        title: "主任医生",
        workUnit: "浙江XXX医院",
        department: "泌尿科2",
        major: "慢性肾炎、肾小管疾病",
        score: '9.1',
        num: 525
    }, {
        photoUrl: "img/default_user.png",
        userId: "U201702070048",
        name: "宋树斌",
        gender: "男",
        title: "主任医生",
        workUnit: "浙江XXX医院",
        department: "泌尿科3",
        major: "肾小管疾病、间质性肾炎",
        score: '8.8',
        num: 2546
    }];
}])
//团队病历
.controller('groupPatientCtrl', ['$scope', '$http', '$state', 'Storage', '$ionicHistory','Doctor','$ionicLoading', function($scope, $http, $state, Storage, $ionicHistory,Doctor,ionicLoading) {

    $scope.grouppatients0 = "";
    $scope.grouppatients1 = "";


    $scope.params = {
        teamId: ''
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.grouppatients1 = "";
        $scope.grouppatients2 = "";
        $scope.params.teamId = $state.params.teamId;
        console.log($scope.params);
        $scope.load();
    });
    $scope.load = function() {
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 1 }) //0->进行中
            .then(function(data) {
                console.log(data)
                $scope.grouppatients0 = data.results
            }, function(err) {
                console.log(err)
            })
        Doctor.getGroupPatientList({ teamId: $scope.params.teamId, status: 0 }) //1->已处理
            .then(function(data) {
                console.log(data);
                $scope.grouppatients1 = data.results;
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

.controller('GroupAddCtrl', ['$scope', '$state','$ionicHistory','Communication','$ionicPopup', 'Storage','Doctor','$ionicLoading','CONFIG',function($scope, $state,$ionicHistory,Communication,$ionicPopup,Storage,Doctor,$ionicLoading,CONFIG) {
  $scope.$on('$ionicView.beforeEnter',function(){
          $scope.me=[{userId:'',name:'',photoUrl:''}];
         Communication.getTeam({teamId:$state.params.teamId})
                .then(function(data){
                  console.log(data)
                  $scope.group=data.results;
                 if(data.results.sponsorId==Storage.get('UID'))$scope.imnotin=false;
                 else $scope.imnotin=true;
                },function(err){
                    console.log(err);
                })
        
  
    })
    $scope.request =function(){
         var confirmPopup = $ionicPopup.confirm({
            title: '确定要加入吗?',
            // template: '确定要结束此次咨询吗?'
            okText:'确定',
            cancelText:'取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                console.log('You are sure');
                 Doctor.getDoctorInfo({userId:Storage.get('UID')})
        .then(function(data){
            $scope.me[0].userId=data.results.userId;
            $scope.me[0].name=data.results.name;
            $scope.me[0].photoUrl=data.results.photoUrl;
            var idStr=$scope.me[0].userId;
             setTimeout(function(){ 
                  window.JMessage.addGroupMembersCrossApp($state.params.teamId,CONFIG.appKey,idStr,
                function(data){
                    console.log(data);
                  
                   
                },function(err){
                 
                    console.log(err);
                }) 
             },500);
                Communication.insertMember({teamId:$state.params.teamId,members:$scope.me})
                    .then(function(data){
                        console.log(data)
                        console.log($scope.me[0].userId)
             
                        if(data.result=="更新成员成功"){
                            $ionicLoading.show({ template: '加入成功', duration: 1500 }); 
                            $ionicHistory.nextViewOptions({disableBack: true});
                            $state.go('tab.groups',{type:'0'});
                        }
                        else {$ionicLoading.show({ template: '你已经是成员了', duration: 1500 })};

                        // setTimeout(function(){$ionicHistory.goBack();},1500);
                    })
                
        });
                
            } else {
                console.log('You are not sure');
            }
        });
    }

}])
//"咨询”问题详情
.controller('detailCtrl', ['$scope', '$state', '$rootScope', '$ionicModal', '$ionicScrollDelegate', '$ionicHistory', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', '$http', 'CONFIG', 'arrTool', 'Communication','Storage', 'wechat','$location','Doctor','$q','Counsel','Account','New',function($scope, $state, $rootScope, $ionicModal, $ionicScrollDelegate, $ionicHistory, $ionicPopover, $ionicPopup, Camera, voice, $http, CONFIG, arrTool, Communication,Storage,wechat,$location,Doctor,$q,Counsel,Account,New) {
    $scope.input = {
        text: ''
    }
    var path = "http://test.go5le.net/?code=" + Storage.get('code') + "&state=";
    $scope.params = {
            //[type]:0=已结束;1=进行中;2=医生
            type: '',
            key: '',
            title: '',
            msgCount: 0,
            helpDivHeight: 0,
            moreMsgs: true,
            UID:Storage.get('UID'),
            realCounselType:'',
            newsType:'',
            counsel:{}
        }
        // var audio = new Audio('http://121.43.107.106:8088/PersonalPhoto/Emotions.mp3');
        // audio.play();
        // $scope.msgs = [];
    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    //render msgs 
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.msgs = [];
        $scope.params.key = '';
        $scope.params.chatId = $state.params.chatId;
        $scope.params.type = $state.params.type;
        $scope.params.msgCount = 0;
        $scope.params.newsType = $scope.params.type=='2'?'12':'11';
        console.log($scope.params)
        
        if ($scope.params.type != '2') {
            $scope.params.key = CONFIG.crossKey;
            //获取counsel信息
            Communication.getCounselReport({counselId:$state.params.counselId})
            .then(function(data){
                console.log(data)
                $scope.params.counsel = data.results;
                $scope.params.targetName = data.results.patientId.name;
                $scope.counseltype= data.results.type=='3'?'2':data.results.type;
                $scope.counselstatus=data.results.status;
                $scope.params.realCounselType=data.results.type;
                Account.getCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId})
                .then(function(res){
                    var head='',body='';
                    if($scope.counseltype!='1'){
                        head+='问诊';
                        if($scope.counselstatus=='0'){
                            head+='-已结束';
                            body='您仍可以向患者追加回答，该消息不计费';
                        }else{
                            body='患者提问不限次数，您可以手动结束';
                        }
                    }else{
                        head+='咨询';
                        if(res.result.count<=0){
                            head+='-已结束';
                            body='您仍可以向患者追加回答，该消息不计费';
                        }else{
                            body='您还需要回答'+res.result.count+'个问题';
                        }
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: head,
                        template: body
                    });
                })
            
            },function(err){
                console.log(err);
            })
        }
        if ($scope.params.type == '2'){
            $scope.params.title = "医生交流";
            Doctor.getDoctorInfo({userId:$scope.params.UID})
            .then(function(data){
                $scope.params.targetName = data.results.name;
            });
        }
        else if ($scope.params.type == '1') $scope.params.title = "咨询-进行中";
        else $scope.params.title = "咨询详情";
        
        // if (window.JMessage) {
        //     window.JMessage.enterSingleConversation($state.params.chatId, $scope.params.key);
        //     getMsg(15);
        // }
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
            toBottom(true,500);
        });
    });

    $scope.$on('$ionicView.enter', function() {
        if ($rootScope.conversation) {
            $rootScope.conversation.type = 'single';
            $rootScope.conversation.id = $state.params.chatId;
        }

        Doctor.getDoctorInfo({userId:$scope.params.UID})
        .then(function(response){
            
            socket.emit('newUser',{user_name:response.results.name,user_id:$scope.params.UID});
            socket.on('err',function(data){
                console.error(data)
                // $rootScope.$broadcast('receiveMessage',data);
            });
            socket.on('getMsg',function(data){
                console.info('getMsg');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.fromID == $state.params.chatId) {
                    $scope.$apply(function(){
                        $scope.pushMsg(data.msg);
                    });
                }
                New.insertNews({userId:$scope.params.UID,sendBy:$scope.params.chatId,readOrNot:1});
                                // $rootScope.$broadcast('receiveMessage',data);
            });
            socket.on('messageRes',function(data){
                console.info('messageRes');
                console.log(data);
                if (data.msg.targetType == 'single' && data.msg.targetID == $state.params.chatId) {
                        $scope.$apply(function(){
                            $scope.pushMsg(data.msg);
                        });
                }
                if($scope.counselstatus==1 && $scope.counseltype==1){
                    Account.modifyCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId,modify:'-1'})
                    .then(function(){
                        Account.getCounts({doctorId:Storage.get('UID'),patientId:$scope.params.chatId})
                        .then(function(data){
                            if(data.result.count<=0){
                                $scope.counselstatus=0;
                                $scope.params.title="咨询";
                                endCounsel(1);
                            }
                        })
                    })
                }
                // $rootScope.$broadcast('messageResponse',data);
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

    $scope.getMsg = function(num) {
        console.info('getMsg');
        return $q(function(resolve,reject){
            var q={
                messageType:'1',
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
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0 || res=='没有更多了!') $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].createTimeInMillis - res[0].createTimeInMillis) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].createTimeInMillis - res[i + 1].createTimeInMillis) > 300000 ? true : false;
                            $scope.msgs.unshift(res[i]);
                        }
                        res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                        res[i].diff = true;
                        $scope.msgs.unshift(res[i]);
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

    function onImageLoad(path) {
        $scope.$apply(function() {
            $scope.imageUrl = path;
        })
            // window.JMessage.getConversationList(function(data){console.log(JSON.parse(data));},
            //   function(err){console.log(err)});
            // window.JMessage.getSingleConversation(function(data){console.log(JSON.parse(data));},
            //   function(err){console.log(err)});
    }

    function onImageLoadFail(err) {

    }
    $scope.$on('image', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $scope.imageHandle.zoomTo(1, true);
        $scope.imageUrl = CONFIG.mediaUrl + (args[2].src_thumb || args[2].localId_thumb);
        $scope.modal.show();
        // if (args[1] == 'img') {
        // window.JMessage.getOriginImageInSingleConversation($state.params.chatId, args[3], onImageLoad, onImageLoadFail);
        // } else {
        // getImage(url,onImageLoad,onImageLoadFail)
        // $scope.imageUrl = args[3];
        // }
        // $scope.image={src:$scope.msgs[msgIndex].content.localThumbnailPath +'.'+ $scope.msgs[msgIndex].content.format};
        // console.log($scope.allImage);
        // $scope.imageUrl=imageUrl;
        // $scope.showModal('templates/msg/imageViewer.html');
    })
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
    // var track=window.document.getElementsById('voiceplay');
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
        console.log(args[1])
        if(args[1].direct=='receive'){
            if($scope.params.type=='2'){
                return $state.go('tab.group-profile', { memberId: args[1].fromID });
            }else{
                Storage.set('getpatientId',args[1].fromID); 
                return $state.go('tab.patientDetail');
            }
            
        }

        // if($scope.params.type=='2'){
        //医生
        // $state.go('tab.group-profile', { memberId: args[1].fromName });
        // }else{
            // $state.go('tab.patientDetail', { memberId: args[1] });
        // }
        event.stopPropagation();
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
                content:endlMsg
            }
            socket.emit('message',{msg:msgJson,to:$scope.params.chatId});
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
                endCounsel($scope.params.realCounselType);
            } else {
            }
        });
    }
    $scope.updateMsg = function(msg){
        console.info('updateMsg');
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos!=-1){
            if(msg.contentType=='image') msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            msg.diff=$scope.msgs[pos].diff;
            // $scope.$apply(function(){
                msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
                $scope.msgs[pos]=msg;
            // });
            alert(JSON.stringify(msg));
        }
        // $scope.msgs=$scope.msgs;
    }
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        if($scope.msgs.length==0){
            msg.diff=true;
        }else{
            msg.diff=(msg.createTimeInMillis - $scope.msgs[$scope.msgs.length-1].createTimeInMillis) > 300000 ? true : false;
        }
        msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        if(msg.contentType=='image') {
            msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            $http.get(msg.content.thumb).then(function(data){
                    $scope.msgs.push(msg);
            })
        }else{
            $scope.msgs.push(msg);
        }
        toBottom(true,500);
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
            contentType:type,
            fromID:$scope.params.UID,
            fromName:thisDoctor.name,
            fromUser:{
                avatarPath: CONFIG.mediaUrl+'uploads/photos/resized'+$scope.params.UID+'_myAvatar.jpg'
            },
            targetID:$scope.params.chatId,
            targetName:$scope.params.counsel.patientId.name,
            targetType:'single',
            status:'send_going',
            createTimeInMillis: Date.now(),
            newsType:$scope.params.newsType,
            // _id:'',
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
        socket.emit('message',{msg:msgJson,to:$scope.params.chatId});
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
        sendmsg($scope.input.text,'text');
        $scope.input.text = '';
    }
    //get image
    $scope.getImage = function(type) {
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
    }
    $scope.stopAndSend = function() {
        wx.stopRecord({
            success: function (res) {
                var ids=['',res.localId];
                var m=msgGen(ids,'voice',true);
                $scope.pushMsg(m);
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
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        if ($state.params.type == "1") $state.go('tab.doing');
        else if ($state.params.type == "0") $state.go('tab.did');
        else $state.go('tab.groups', { type: '1' });
    }
}])
//团队信息
.controller('GroupDetailCtrl', ['$scope', '$state', '$ionicModal', 'Communication','$ionicPopup','Storage','Doctor',function($scope, $state, $ionicModal,Communication,$ionicPopup,Storage,Doctor) {
    $scope.$on('$ionicView.beforeEnter',function(){
       
         Communication.getTeam({teamId:$state.params.teamId})
                .then(function(data){
                  
                  $scope.team=data.results;
                  $scope.members2=data.results.members;
                  console.log($scope.members2)
            Doctor.getDoctorInfo({userId:$scope.team.sponsorId})
            .then(function(data){
                console.log(data);
               // $scope.members1=data.results;
                 $scope.members=$scope.members2.concat(data.results);
                console.log($scope.members1)
            });
                  if($scope.team.sponsorId==Storage.get('UID')) $scope.ismyteam=true;
                  else $scope.ismyteam=false;
                },function(err){
                    console.log(err);
                })
        

        console.log($scope.team)
    })
    

    $scope.addMember = function() {
        console.log($scope.team.teamId)
        $state.go('tab.group-add-member', {teamId:$scope.team.teamId});
    }
    $scope.viewProfile = function(member){
        $state.go('tab.group-profile',{memberId:member.userId});
    }
    $scope.showQRCode = function() {
        $state.go('tab.group-qrcode', { team: $scope.team });
    }
    $scope.closeModal = function() {
        // $scope.imageHandle.zoomTo(1,true);
        $scope.modal.hide();
        $scope.modal.remove()
    };
    $scope.gokick=function(){
          $state.go('tab.group-kick', { teamId: $scope.team.teamId });

    }
    // $scope.leaveteam=function(){
    //        var confirmPopup = $ionicPopup.confirm({
    //         title: '确定要退出团队吗?',
    //         // template: '确定要结束此次咨询吗?'
    //         okText: '确定',
    //         cancelText: '取消'
    //     });
    //     confirmPopup.then(function(res) {
    //         if (res) {
    //             console.log('You are sure');
    //             console.log($state.params.teamId);
    //             console.log(Storage.get('UID'));
    //             Communication.removeMember({teamId:$state.params.teamId,membersuserId:Storage.get('UID')})
    //             .then(function(data){
    //               console.log(data)
    //             },function(err){
    //                 console.log(err)
    //             })
    //         } else {
    //             console.log('You are not sure');
    //         }
    //     });

    // }
}])
//踢人
.controller('GroupKickCtrl', ['$scope', '$state','$ionicModal', 'Communication','$ionicPopup','Storage','CONFIG', function($scope, $state,$ionicModal,Communication,$ionicPopup,Storage,CONFIG) {
    $scope.$on('$ionicView.beforeEnter',function(){
       
         Communication.getTeam({teamId:$state.params.teamId})
                .then(function(data){
                  console.log(data)
                  $scope.doctors=data.results.members;
                },function(err){
                    console.log(err);
                })
    }) 
     $scope.kick=function(id){
        var confirmPopup = $ionicPopup.confirm({
            title: '确定要将此人移出团队吗?',
            okText: '确定',
            cancelText: '取消'
        });
        confirmPopup.then(function(res) {
            if (res) {
                console.log('You are sure');
                console.log($state.params.teamId);
             // setTimeout(function(){ 
             //      window.JMessage.removeGroupMembersCrossApp($state.params.teamId,CONFIG.appKey,$scope.doctors[id].userId,
             //    function(data){
             //        console.log(data);
                  
                   
             //    },function(err){
                 
             //        console.log(err);
             //    })
             // },500); 
                Communication.removeMember({teamId:$state.params.teamId,membersuserId:$scope.doctors[id].userId})
                .then(function(data){
                  console.log(data)
                    if(data.result=="更新成员成功"){
                      Communication.getTeam({teamId:$state.params.teamId})
                      .then(function(data){
                       console.log(data)
                       $scope.doctors=data.results.members;
                       },function(err){
                       console.log(err);
                      })
                    };
                },function(err){
                    console.log(err)
                })
            } else {
                console.log('You are not sure');
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
.controller('GroupAddMemberCtrl', ['$scope', '$state', '$ionicHistory', 'arrTool', 'Communication', '$ionicLoading', '$rootScope', 'Patient', 'JM', 'CONFIG', function($scope, $state, $ionicHistory, arrTool, Communication, $ionicLoading, $rootScope, Patient, JM, CONFIG) {

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
        // $scope.$apply(function() {
        Patient.getDoctorLists({ skip: $scope.skipnum, limit: 10 })
            .then(function(data) {
                console.log(data.results)
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
            // });
    }
    $scope.goSearch = function() {
        $scope.isnotsearching = true;
        $scope.issearching = false;


        $scope.moredata = false;
        Patient.getDoctorLists({ skip: 0, limit: 10, name: $scope.search.name })
            .then(function(data) {
                console.log(data.results)
                $scope.doctors = data.results;
                if (data.results.length == 0) {
                    console.log("aaa")
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
        $scope.search.name = '';

    }
    $scope.clearSearch = function() {
        $scope.search.name = '';
    }

    $scope.confirmAdd = function() {
        if ($state.params.type == 'new') {
            $rootScope.newMember = $rootScope.newMember.concat($scope.group.members);
            $ionicHistory.goBack();
        } else {
            console.log($state.params.teamId)

            Communication.insertMember({ teamId: $state.params.teamId, members: $scope.group.members })
                .then(function(data) {
                    console.log(data.result)
                    if (data.result == "更新成员成功") {
                        $ionicLoading.show({ template: '添加成功', duration: 1500 });
                    }
                    setTimeout(function() { $ionicHistory.goBack(); }, 1500);
                })

        }
        // console.log(idStr);

        // Communication.insertMember({ teamId: $state.params.teamId, members: $scope.group.members })
        //     .then(function(data) {
        //         $ionicLoading.show({ template: '添加成功', duration: 1500 });
        //         setTimeout(function() { $ionicHistory.goBack(); }, 1500);
        //     })

    }

}])


//团队聊天
.controller('GroupChatCtrl', ['$scope', '$state', '$rootScope', '$ionicHistory', '$ionicModal', '$ionicScrollDelegate', '$rootScope', '$ionicPopover', '$ionicPopup', 'Camera', 'voice', 'Communication','wechat','$location','Doctor','Storage', '$q','CONFIG','arrTool','$http','New',function($scope, $state, $rootScope, $ionicHistory, $ionicModal, $ionicScrollDelegate, $rootScope, $ionicPopover, $ionicPopup, Camera, voice, Communication,wechat,$location,Doctor,Storage,$q,CONFIG,arrTool,$http,New) {
    $scope.input = {
        text: ''
    }
    var path = "http://test.go5le.net/?code=" + Storage.get('code') + "&state=";
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
        targetName:''
    }
    $rootScope.patient = {}
        // $rootScope.goConclusion =function(){
        //     if(params.type=='2') location.hash = "#conclusion";
        //     else $state.go('tab.group-conclusion',{teamId:params.teamId,groupId:params.groupId,type:params.type});
        // }
    $scope.scrollHandle = $ionicScrollDelegate.$getByHandle('myContentScroll');
    function toBottom(animate,delay){
        if(!delay) delay=100;
        setTimeout(function(){
            $scope.scrollHandle.scrollBottom(animate);
        },delay)
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        console.log()
        $rootScope.patient = {
                // name: '卢兴芳',
                // age: '23',
                // teamId: 'team111',
                // groupId: 'group111',
                // undergo: true,
                // gender: '男',
                // time: '4/9/17 12:17',
                // discription: '现在口服药有，早上拜新同两片，中午47.5mg的倍他乐克一片'
            }
            // $rootScope.patient = $state.params.
            //发送信息的extra字段，传递teamId
        $scope.msgExtra = {
            teamId: $state.params.teamId
        };
        $scope.msgs = [];
        $scope.params.msgCount = 0;
        console.log($state.params);
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        if ($scope.params.type == '0') {
            $scope.params.newsType='13';
            Communication.getTeam({ teamId: $scope.params.teamId })
                .then(function(data) {
                    console.log(data)
                    $scope.params.team = data.results;
                    $scope.params.title = $scope.params.team.name + '(' + $scope.params.team.number + ')';
                    $scope.params.targetName = $scope.params.team.name;
                })

        } else if ($scope.params.type == '1') {
            getConsultation();
            $scope.params.newsType=$scope.params.teamId;
            $scope.params.hidePanel = true;
            $scope.params.title = '会诊';
            $scope.params.isDiscuss = true;
        } else if ($scope.params.type == '2') {
            getConsultation();
            $scope.params.newsType=$scope.params.teamId;
            $scope.params.hidePanel = false;
            $scope.params.title = '会诊';
            $scope.params.isDiscuss = true;
            $rootScope.patient.undergo = false;
            $scope.params.isOver = true;
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
            $rootScope.conversation.type = 'group';
            $rootScope.conversation.id = $scope.params.groupId;
            // if (window.JMessage) {
            //     window.JMessage.enterGroupConversation($scope.params.groupId);
            //     getMsg(15);
            // }
            // Doctor.getDoctorInfo({userId:$scope.params.UID})
            // .then(function(response){
                // socket = io.connect('ws://121.43.107.106:4050/chat');
                socket.emit('newUser',{user_name:thisDoctor.name,user_id:$scope.params.UID});
                socket.on('err',function(data){
                    console.error(data)
                    // $rootScope.$broadcast('receiveMessage',data);
                });
                socket.on('getMsg',function(data){
                    console.info('getMsg');
                    console.log(data);
                    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
                        $scope.$apply(function(){
                            $scope.pushMsg(data.msg);
                        });
                    }
                    New.insertNews({userId:$scope.params.UID,sendBy:$scope.params.groupId,readOrNot:1});
                                    // $rootScope.$broadcast('receiveMessage',data);
                });
                socket.on('messageRes',function(data){
                    console.info('messageRes');
                    console.log(data);
                    if (data.msg.targetType == 'group' && data.msg.targetID == $state.params.groupId) {
                        $scope.$apply(function(){
                            $scope.pushMsg(data.msg);
                        })
                    }
                });
            // },function(err){
                // console.log(err);
            // })
            $scope.getMsg(15).then(function(data){
                $scope.msgs=data;
                toBottom(true,500);
            });

            imgModalInit();
        })
        //receiving new massage
    // $scope.$on('receiveMessage', function(event, msg) {
    //     console.log(event);
    //     console.log(msg);
    //     if (msg.targetType == 'group' && msg.targetID == $scope.params.groupId) {
    //         viewUpdate(5);
    //     }
    // });
    $scope.$on('keyboardshow', function(event, height) {
        $scope.params.helpDivHeight = height;
        toBottom(true,100);
    })
    $scope.$on('keyboardhide', function(event) {
        $scope.params.helpDivHeight = 0;
        // $ionicScrollDelegate.scrollBottom();
    })
    $scope.$on('$ionicView.beforeLeave', function() {
        socket.off('messageRes');
        socket.off('getMsg');
        socket.off('err');
        socket.emit('disconnect');
        // socket.close();
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
                    $scope.params.title+= '-'+data.result.patientId.name;
                    console.log(data)
                    $rootScope.patient = data.result;
                    $scope.params.targetName = '['+data.result.patientId.name+']'+$scope.params.team.name;
                    
                })
    }
    $scope.DisplayMore = function() {
        $scope.getMsg(15).then(function(data){
            $scope.msgs=data;
        });
    }
    // $scope.scrollBottom = function() {
    //     $scope.scrollHandle.scrollBottom(true);
    // }
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
                var res=[];
                for(var i in d){
                    res.push(d[i].content);
                }
                if(res.length==0 || res=='没有更多了!') $scope.params.moreMsgs = false;
                else{
                    $scope.params.msgCount += res.length;
                    // $scope.$apply(function() {
                        if ($scope.msgs.length!=0) $scope.msgs[0].diff = ($scope.msgs[0].createTimeInMillis - res[0].createTimeInMillis) > 300000 ? true : false;
                        for (var i = 0; i < res.length - 1; ++i) {
                            if(res[i].contentType=='image') res[i].content.thumb=CONFIG.mediaUrl+res[i].content['src_thumb'];
                            res[i].direct = res[i].fromID==$scope.params.UID?'send':'receive';
                            res[i].diff = (res[i].createTimeInMillis - res[i + 1].createTimeInMillis) > 300000 ? true : false;
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


    // function msgsRender(first,last){
    //     while(first!=last){
    //         $scope.msgs[first+1].diff=($scope.msgs[first+1].createTimeInMillis-$scope.msgs[first].createTimeInMillis)>300000?true:false;
    //         first++;
    //     }
    // }
    // $http.get("data/sampleMsgs.json").success(function(data) {
    //     $scope.msgs = data;
    //     // $scope.$apply(function(){
    //         msgsRender(0,data.length-1);
    //     // });
    //     // 

    // });


    $scope.togglePanel = function() {
        $scope.params.hidePanel = !$scope.params.hidePanel;
    }
    $scope.viewGroup = function(){
        $state.go('tab.group-detail',{teamId:$scope.params.teamId});
    }

    $scope.content = {
            pics: [
                'img/avatar.png',
                'img/ben.png',
                'img/mike.png'
            ]
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

    function onImageLoad(path) {
        $scope.$apply(function() {
            $scope.imageUrl = path;
        })
    }

    function onImageLoadFail(err) {

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
        $scope.imageUrl = CONFIG.mediaUrl + (args[2].src_thumb || args[2].localId_thumb);
        $scope.modal.show();
        // $scope.imageUrl = args[2];
        // $scope.modal.show();
        // if (args[1] == 'img') {
        // window.JMessage.getOriginImageInSingleConversation($state.params.chatId, args[3], onImageLoad, onImageLoadFail);
        // } else {
        // $scope.imageUrl = args[3];
        // }
    })
    $scope.$on('profile', function(event, args) {
        console.log(args)
        event.stopPropagation();
        $state.go('tab.group-profile', { memberId: args[1].fromID });
    })
    $scope.$on('viewcard', function(event, args) {
        console.log(args[1]);
        event.stopPropagation();
        // if (args[2].target.tagName == "IMG") {
        //     $scope.imageHandle.zoomTo(1, true);
        //     $scope.imageUrl = args[2].target.currentSrc;
        //     console.log(args[2].target.attributes.hires.nodeValue);
        //     $scope.modal.show();
        // }
        // else{
        //     $state.go('tab.consult-detail',{consultId:args[1]});
        // }
        if($scope.params.type=='0'){
            Communication.getConsultation({ consultationId: args[1].content.consultationId})
                .then(function(data) {
                    $state.go('tab.group-chat',{'type':data.result.status,'teamId':$scope.params.teamId,'groupId':args[1].content.consultationId});
                    // $scope.params.title+= '-'+data.result.patientId.name;
                    // console.log(data)
                    // $rootScope.patient = data.result;
                    
                })
        }
        // $state.go('tab.consult-detail',{consultId:args[1]});
    })

    $scope.toolChoose = function(data) {
        // console.log(data);
        if (data == 0) $state.go('tab.selectDoc');
        if (data == 1) $state.go('tab.selectTeam');
    }
    $scope.viewPic = function(src) {
        $scope.imageUrl = src;
        $scope.modal.show();
    }
    $scope.updateMsg = function(msg){
        console.info('updateMsg');
        var pos=arrTool.indexOf($scope.msgs,'createTimeInMillis',msg.createTimeInMillis);
        if(pos!=-1){
            if(msg.contentType=='image') msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            msg.diff=$scope.msgs[pos].diff;
            // $scope.$apply(function(){
                msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
                $scope.msgs[pos]=msg;
            // });
        }
        // $scope.msgs=$scope.msgs;
    }
    $scope.pushMsg = function(msg){
        console.info('pushMsg');
        if($scope.msgs.length==0){
            msg.diff=true;
        }else{
            msg.diff=(msg.createTimeInMillis - $scope.msgs[$scope.msgs.length-1].createTimeInMillis) > 300000 ? true : false;
        }
        msg.direct = msg.fromID==$scope.params.UID?'send':'receive';
        if(msg.contentType=='image') {
            msg.content.thumb=CONFIG.mediaUrl+msg.content['src_thumb'];
            $http.get(msg.content.thumb).then(function(data){
                $scope.msgs.push(msg);
            })
        }else{
            $scope.msgs.push(msg);
        }
        toBottom(true,500);
        // $scope.$apply(function(){
            // $scope.msgs.push(msg);

        // });
        // $scope.msgs=$scope.msgs;
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
            // _id:'',
            content:data
        }
        console.info('socket.connected'+socket.connected);
        console.log(msgJson);
        socket.emit('message',{msg:msgJson,to:$scope.params.groupId});
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
    }
    $scope.stopAndSend = function() {
        wx.stopRecord({
            success: function (res) {
                var ids=['',res.localId];
                var m=msgGen(ids,'voice',true);
                $scope.pushMsg(m);
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
.controller('GroupConclusionCtrl',['$state','$scope','$ionicModal','$ionicScrollDelegate','Communication','$ionicLoading','CONFIG','Account',function($state,$scope,$ionicModal,$ionicScrollDelegate,Communication,$ionicLoading,CONFIG,Account){
    $scope.input = {
        text: ''
    }
    $scope.params = {
        type: '',
        groupId: '',
        teamId: ''
    }
    // $scope.content = {
    //     pics: [
    //         'img/avatar.png',
    //         'img/ben.png',
    //         'img/mike.png'
    //     ]
    // }
    $scope.patient = {
    }
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.input.text='';
        $scope.params.type = $state.params.type;
        $scope.params.groupId = $state.params.groupId;
        $scope.params.teamId = $state.params.teamId;
        Communication.getConsultation({ consultationId: $scope.params.groupId })
            .then(function(data) {
                console.log(data)
                $scope.patient = data.result;
                
            })
    })
        // $scope.save = function() {
        //     var confirmPopup = $ionicPopup.confirm({
        //         title: '确定要结束此次咨询吗?',
        //         // template: '确定要结束此次咨询吗?'
        //         okText:'确定',
        //         cancelText:'取消'
        //     });
        //     confirmPopup.then(function(res) {
        //         if (res) {
        //             console.log('You are sure');
        //         } else {
        //             console.log('You are not sure');
        //         }
        //     });
        // }
        //view image
    $scope.zoomMin = 1;
    $scope.imageUrl = '';
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    });
    $scope.closeModal = function() {
        $scope.imageHandle.zoomTo(1, true);
        $scope.modal.hide();
        // $scope.modal.remove()
    };
    $scope.viewPic = function(src) {
        $scope.imageUrl = src;
        $scope.modal.show();
        // $scope.modal.remove()
    };
    $scope.switchZoomLevel = function() {
        if ($scope.imageHandle.getScrollPosition().zoom != $scope.zoomMin)
            $scope.imageHandle.zoomTo(1, true);
        else {
            $scope.imageHandle.zoomTo(3, true);
        }
    }
    $scope.save = function() {

        Communication.conclusion({ consultationId: $state.params.groupId, conclusion: $scope.input.text, status: 0 })
            .then(function(data) {
                console.log(data)
                Communication.getCounselReport({ counselId: $scope.patient.diseaseInfo.counselId })
                    .then(function(res) {
                        var DID=res.results.doctorId.userId,PID=res.results.patientId.userId
                        var msgJson = {
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
                            createTimeInMillis: Date.now(),
                            content: {
                                text: $scope.input.text

                            }
                        }
                        Account.modifyCounts({doctorId:DID,patientId:PID,modify:'-1'})
                        .then(function(){
                            socket.emit('newUser', { user_name: res.results.doctorId.name, user_id: DID });
                            socket.emit('message', { msg: msgJson, to: PID });
                            // socket.on('messageRes', function(data) {
                            // socket.off('messageRes');
                            socket.emit('disconnect');
                            // $state.go('tab.detail', { type: '2', chatId: doc.userId, counselId: msgdata.counselId });
                            // })
                            $ionicLoading.show({ template: '回复成功', duration: 1500 });
                            setTimeout(function() {
                                $state.go('tab.groups', { type: '0' });
                            }, 1500);
                        })
                    })

            }, function(err) {
                console.log(err);
            })
    }



    $scope.$on('$ionicView.leave', function() {
        if ($scope.modal) $scope.modal.remove();
    })
}])
.controller('selectDocCtrl', ['$state', '$scope', 'JM', '$ionicPopup','$ionicLoading','$ionicScrollDelegate','Patient', 'Storage','CONFIG', function($state, $scope, JM, $ionicPopup,$ionicLoading,$ionicScrollDelegate,Patient, Storage,CONFIG) {
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
        console.log($scope.params.moredata);
        console.log($scope.params.isSearch);
    })
    
    $scope.listenenter = function(){

    }
    $scope.loadMore = function() {
        Patient.getDoctorLists({ skip: $scope.params.skip, limit: $scope.params.limit })
            .then(function(data) {
                console.log(data.results)
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

    $scope.clearSearch = function(){
        $scope.params.query='';
        console.log('clearSearch');

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
                // window.JMessage.sendGroupTextMessageWithExtras(doc.userId,'[咨询转发]',msgdata,'',
                //     function(m){
                //         console.log(m);
                //         setTimeout(function() { $state.go('tab.detail', { type: '2', chatId: doc.userId }); }, 200);
                //     },function(err){
                //         console.error(err);
                //     });
                var msgJson={
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
                    content:msgdata
                }
                socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId});
                socket.emit('message',{msg:msgJson,to:doc.userId});
                socket.on('messageRes',function(data){
                    socket.off('messageRes');
                    socket.emit('disconnect');
                    $state.go('tab.detail', { type: '2', chatId: doc.userId,counselId:msgdata.counselId});
                })
                
                // JM.sendCustom('single', doc.userId, '', msgdata)
                //     .then(function(data) {
                //         console.log(data)
                //         setTimeout(function() { $state.go('tab.detail', { type: '2', chatId: doc.userId }); }, 200);
                //     }, function(err) {
                //         console.info('转发失败');
                //         console.log(err);
                //     })
            } else {
            }
        });
    }
}])
.controller('selectTeamCtrl', ['$state', '$scope', 'JM', '$ionicPopup', 'Doctor', 'Communication', 'Storage','CONFIG','$filter', function($state, $scope, JM, $ionicPopup, Doctor, Communication, Storage,CONFIG,$filter) {
    $scope.params={
        // isSearch:false,
    }
    $scope.query={
        name:'',
    }
    console.log($state.params);
    Doctor.getMyGroupList({ userId: Storage.get('UID') })
        .then(function(data) {
            $scope.teams = data;
        }, function(err) {
            console.log(err);
        });
    $scope.clearSearch = function(){
        $scope.query.name='';
    }
    // $scope.$watch('query.name',function(newVal,oldVal){
    //     if(newVal==''){
    //         $scope.params.isSearch=false;
    //     }
    // })
    $scope.sendTo = function(team) {
            var confirmPopup = $ionicPopup.confirm({
                title: '转发给：' + team.name,
                // template: '确定要结束此次咨询吗?'
                okText: '确定',
                cancelText: '取消'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    var time = new Date();
                    var gid='G'+$filter('date')(time, 'MMddHmsss');
                    // var gid;
                    var msgdata = $state.params.msg;
                    var d = {
                        teamId: team.teamId,
                        counselId: msgdata.counselId,
                        sponsorId: msgdata.doctorId,
                        patientId: msgdata.patientId,
                        consultationId: gid,
                        status: '1'
                    }
                    msgdata.consultationId=gid;
                    msgdata.targetId=team.teamId;
                    msgdata.fromId=thisDoctor.userId;
                    var msgJson={
                        contentType:'custom',
                        fromID:thisDoctor.userId,
                        fromName:thisDoctor.name,
                        fromUser:{
                            avatarPath:CONFIG.mediaUrl+'uploads/photos/resized'+thisDoctor.userId+'_myAvatar.jpg'
                        },
                        targetID:team.teamId,
                        teamId:team.teamId,
                        targetName:msgdata.patientName + '-' +team.name,
                        targetType:'group',
                        status:'send_going',
                        newsType:'13',
                        createTimeInMillis: Date.now(),
                        content:msgdata
                    }
                    Communication.newConsultation(d)
                    .then(function(data){
                        console.log(data);
                        socket.emit('newUser',{user_name:thisDoctor.name,user_id:thisDoctor.userId});
                        socket.emit('message',{msg:msgJson,to:team.teamId});
                        socket.on('messageRes',function(data){
                            socket.off('messageRes');
                            socket.emit('disconnect');
                            $state.go('tab.group-chat', { type: '0', groupId: team.teamId, teamId: team.teamId });
                        });
                    },function(er){
                        console.error(err);
                    })
                    

                    // window.JMessage.getGroupMembers(team.teamId,
                    //     function(response) {
                    //         var res = JSON.parse(response);
                    //         console.log(res);
                    //         var u = [];
                    //         for (var i = 1; i < res.length; i++) u.push(res[i].userName);
                    //         u = u.join(',');
                    //         // var gn = md5($state.params.msg.counsel.counselId + team.teamId, "kidney").substr(4, 8) $state.params.msg.patientName+'-'+team.name
                    //         window.JMessage.createGroup($state.params.msg.patientName+'-'+team.name, 'consultatioin_open', u,
                    //             function(gid) {
                    //                 console.log(gid);
                    //                 var d = {
                    //                     teamId: team.teamId,
                    //                     counselId: $state.params.msg.counsel.counselId,
                    //                     sponsorId: $state.params.msg.doctorId,
                    //                     patientId: $state.params.msg.patientId,
                    //                     consultationId: gid,
                    //                     status: '1'
                    //                 }
                    //                 var msgdata = {
                    //                     counsel: $state.params.msg.counsel,
                    //                     type: 'card',
                    //                     patientId: $state.params.msg.patientId,
                    //                     doctorId: $state.params.msg.doctorId,
                    //                     targetId: team.teamId,
                    //                     fromId: Storage.get('UID'),
                    //                     consultationId: gid
                    //                 }
                    //                 Communication.newConsultation(d)
                    //                     .then(function(con) {
                    //                         // window.JMessage.sendGroupTextMessageWithExtras(d.consultationId,'[团队咨询]',msgdata,
                    //                         //     function(m){
                    //                         //         console.log(m);
                    //                         //         setTimeout(function(){
                    //                         //             $state.go('tab.group-chat', { type: '1', groupId: gid, teamId: team.teamId });
                    //                         //         },200);
                    //                         //     },function(err){
                    //                         //         console.error(err);
                    //                         //     });
                    //                         window.JMessage.sendGroupCustomMessage(d.consultationId, msgdata,
                    //                             function(m) {
                    //                                 console.log(m);
                    //                                 $state.go('tab.group-chat', { type: '1', groupId: gid, teamId: team.teamId });
                    //                             },
                    //                             function(err) {
                    //                                 console.log(err);
                    //                             });
                    //                     }, function(err) {
                    //                         console.log(err);
                    //                     })

                    //             },
                    //             function(err) {
                    //                 console.log(err);
                    //             })
                    //     },
                    //     function(err) {
                    //         console.log(err);
                    //     })
                    console.log('You are sure');
                } else {
                    console.log('You are not sure');
                }
            });
        }
}])
.controller('consultDetailCtrl', ['$state', '$scope', '$ionicModal', '$ionicScrollDelegate', function($state, $scope, $ionicModal, $ionicScrollDelegate) {
    $scope.consult = {
        name: '李大山',
        age: '56',
        gender: '男',
        time: '4/11/17 8:57',
        discription: '现在口服药有，早上拜新同两片，中午47.5mg的倍他乐克一片',

    }
    $scope.content = {
            pics: [
                'img/avatar.png',
                'img/max.png',
                'img/ionic.png'
            ]
        }
        //view image
    $scope.zoomMin = 1;
    $scope.imageUrl = '';
    $ionicModal.fromTemplateUrl('templates/msg/imageViewer.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
        // $scope.modal.show();
        $scope.imageHandle = $ionicScrollDelegate.$getByHandle('imgScrollHandle');
    });
    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
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
    $scope.viewPic = function(url) {
        $scope.imageUrl = url;
        $scope.modal.show();
    }
    $scope.$on('$ionicView.leave', function() {
        if ($scope.modal) $scope.modal.remove();
    })
}])
.controller('doctorProfileCtrl',['$scope','$state','Doctor','Storage','$ionicHistory',function($scope,$state,Doctor,Storage,$ionicHistory){
    $scope.goBack = function(){
        $ionicHistory.goBack();
    }
    $scope.doctor={};
    $scope.goChat = function(){
        $state.go('tab.detail',{type:'2',chatId:$state.params.memberId});
    }
    $scope.$on('$ionicView.beforeEnter',function(){
        console.log($state.params.memberId)
        if($state.params.memberId==Storage.get('UID'))$scope.isme=true;
        else $scope.isme=false;
        // if($scope.doctor.userId!=$state.params.member.userId){
        //     $scope.doctor=$state.params.member;

            Doctor.getDoctorInfo({userId:$state.params.memberId})
            .then(function(data){
                console.log(data);
                $scope.doctor=data.results;
            });
        // }
    })
    // $scope.teams=[
    //       {
    //           photoUrl:"img/avatar.png",
    //           groupId:"D201703240001",
    //           name:"浙一肾病管理团队",
    //           workUnit:"浙江XXX医院",
    //           major:"肾上腺分泌失调",
    //           num:31
    //       }];
}])
