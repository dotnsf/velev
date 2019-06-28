//. velev.js

//. 各フロアにやってくる人
var waiting_queue = [
  /*
   { sec: 開始から何秒後にやってくる, src: どのフロアから, dst: どのフロアへ行こうとしているか } の配列
   この例ではスタート直後に１１人が１階にやってきて、それぞれの目的階へ移動する。
   その後、６秒後に１階から５階へ行く人が現れる
   */
  { sec: 0, src: 1, dst: 5 },
  { sec: 0, src: 1, dst: 3 },
  { sec: 0, src: 1, dst: 5 },
  { sec: 0, src: 1, dst: 4 },
  { sec: 0, src: 1, dst: 2 },
  { sec: 0, src: 1, dst: 3 },
  { sec: 0, src: 1, dst: 4 },
  { sec: 0, src: 1, dst: 4 },
  { sec: 0, src: 1, dst: 5 },
  { sec: 0, src: 1, dst: 5 },
  { sec: 0, src: 1, dst: 3 },
  { sec: 6, src: 1, dst: 5 }   //. この人がボタンを押した時には全てのエレベータが稼働中、後から気づかせる必要がある

];

var waitings = [];

//. １秒毎に呼び出される関数
function fireOneSecond( second ){
  //console.log( 'fireOneSecond(' + second + '): ' );

  if( waitings.length > 0 ){
    var elevators_status = getElevatorsStatus();
    var idx = -1;
    for( var i = 0; i < elevators_status.length && idx == -1; i ++ ){
      var s = elevators_status[i];
      console.log( s );
      if( s.mode == 0 ){  //. 停止中のエレベータがあったら使う
        idx = i;
        var w = waitings.shift();
        goFloor( idx, w.floor );
      }
    }
    if( idx == -1 ){
      //. 停止中のエレベータがなかったら？？
    }
  }
}

//. エレベータ呼び出しのボタンが押された
function fireCallButtonPush( floor, updown ){ //. floor: 階, updown: { -1: 下, 1: 上 }
  //console.log( 'fireCallButtonPush(' + floor + ',' + updown + '): ' );

  //. サンプルコード
  /*
   このコードなしにデフォルト設定の waiting_queue のまま実行すると、
   最後の（３０秒後に５階にやってくる）人がいつまでもエレベータに乗れなくなる。
   */

  var elevators_status = getElevatorsStatus();
  var idx = -1;
  for( var i = 0; i < elevators_status.length && idx == -1; i ++ ){
    var s = elevators_status[i];
    if( s.mode == 0 ){  //. 停止中のエレベータがあったら使う
      idx = i;
      goFloor( idx, floor );
    }
  }
  if( idx == -1 ){
    //. 停止中のエレベータがなかったら？？
    waitings.push( { floor: floor, updown: updown } );
  }
}

//. エレベータ内のボタンが押された
function fireElevatorButtonPush( num, floor ){ //. num: エレベータ番号(0 - n-1), floor: 階
  //console.log( 'fireElevatorButtonPush(' + num + ',' + floor + '): ' );

}
