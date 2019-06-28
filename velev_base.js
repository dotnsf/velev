//. velev_base.js

//. elevator
class elevator{
  constructor( num, max_floor, limit, move_second, stop_second ){
    this.num = num;
    this.max_floor = max_floor;
    this.limit = limit;
    this.move_second = move_second;
    this.stop_second = stop_second;

    this.updown = 0;        //. -1:Down, 0:停止, 1:Up
    this.floor = 1;         //. 現在地
    this.people = [];       //. 現在乗車してる person の配列
    this.move_count = 0;    //. move_second になったら到着
    this.stop_count = 0;    //. stop_second になったら発車
    this.buttons = [];      //. フロアボタンの状態
    for( var i = 0; i < this.max_floor; i ++ ){
      this.buttons.push( 0 );
    }
    this.mode = 0;          //. 0:停止, 1:移動中, 2: 乗降中
  }

  //. 現在の状態
  getStatus(){
    var status = {
      num: this.num,
      updown: this.updown,
      floor: this.floor,
      people: this.people,
      move_count: this.move_count,
      stop_count: this.stop_count,
      buttons: this.buttons,
      mode: this.mode
    };
    return status;
  }

  //. p_array.length 人乗車する
  addPeople( p_array ){
    //. 乗車後の待ち行列を返す
    var r = [];
    if( this.people.length + p_array.length <= this.limit ){
      //. 待っている人全員が乗れる
      for( var i = 0; i < p_array.length; i ++ ){
        var p = p_array[i];
        if( this.buttons[p.dst_floor-1] == 0 ){
          this.buttons[p.dst_floor-1] = 1;
          fireElevatorButtonPush( this.num, p.dst_floor );
        }
      }

      p_array.forEach( function( p ){
        if( p.waitsec > max_wait ){
          max_wait = p.waitsec;
        }
        sum_wait += p.waitsec;
      });

      Array.prototype.push.apply( this.people, p_array );

      if( p_array[0].src_floor < p_array[0].dst_floor ){
        floors[p_array[0].src_floor-1].up = false;
      }else{
        floors[p_array[0].src_floor-1].down = false;
      }
    }else{
      //. 待っている人の一部しか乗れない
      var n = this.limit - this.people.length;  //. 乗れる人数
      var p_array1 = p_array.slice( 0, n );
      var p_array2 = p_array.slice( n );
      for( var i = 0; i < p_array1.length; i ++ ){
        var p = p_array1[i];
        if( this.buttons[p.dst_floor-1] == 0 ){
          this.buttons[p.dst_floor-1] = 1;
          fireElevatorButtonPush( this.num, p.dst_floor );
        }
      }

      p_array1.forEach( function( p ){
        if( p.waitsec > max_wait ){
          max_wait = p.waitsec;
        }
        sum_wait += p.waitsec;
      });

      Array.prototype.push.apply( this.people, p_array1 );
      r = p_array2;
    }

    return r;
  }

  //. 現在のフロアで降りる人がいれば降ろす
  offPeople(){
    //. 降りた人数を返す
    var n = 0;
    if( this.mode == 2 && this.people.length > 0 ){
      for( var i = 0; i < this.people.length; i ++ ){
        var p = this.people[i];
        if( p.dst_floor == this.floor ){
          if( p.waitsec > max_process ){
            max_process = p.waitsec;
          }
          sum_process += p.waitsec;

          this.people.splice( i, 1 );
          i --;
          n ++;
        }
      }
      this.buttons[this.floor-1] = 0;
    }

    //. 全員降りたら mode = 0 & updown = 0
    if( this.people.length == 0 ){
      this.mode = this.updown = 0;
    }

    return n;
  }

  //. エレベーターのボタンを押す
  pushFloorButton( f ){
    this.buttons[f-1] = 1;
  }

  //. 停止しているエレベーターを f 階に向かわせる
  goFloor( f ){
    //. 返り値： 1:成功, -1: エラー（稼働中）, 0:何もしない（既にf階）
    if( this.updown == 0 ){
      if( this.floor < f ){
        this.updown = 1;
        this.buttons[f-1] = 1;
        this.mode = 1;
        return 1;
      }else if( this.floor > f ){
        this.updown = -1;
        this.buttons[f-1] = 1;
        this.mode = 1;
        return 1;
      }else{
        this.mode = 0;
        return 0;
      }
    }else{
      return -1;
    }
  }

  //. １秒経過
  oneSecondLater(){
    //. エレベータの中にいる人の経過時間を更新
    this.people.forEach( function( p ){
      p.waitsec ++;
    });

    //. エレベータのモードで場合分け
    switch( this.mode ){
    case 0: //. 停止モード
      //. エレベータ内のボタンが押されているか調べる
      var b = -10000;
      for( var i = 0; i < this.max_floor && b == -10000; i ++ ){
        if( this.buttons[i] == 1 ){
          b = i + 1;
        }
      }
      if( b != -10000 ){
        if( this.floor < b ){
          //. 今いる階よりも上の階が押されていた
          this.updown = 1;
          this.mode = 1;
        }else if( this.floor > b ){
          //. 今いる階よりも下の階が押されていた
          this.updown = -1;
          this.mode = 1;
        }else{
          //. 今いる階が押されていた
          this.mode = 0;
        }
      }
      break;
    case 1: //. 移動モード
      this.move_count ++;
      if( this.move_count == this.move_second ){
        //. フロアに到着
        this.move_count = 0;
        this.floor += this.updown;
        if( this.buttons[this.floor-1] == 1 ){
          //. 到着したフロアのボタンが押されていた場合
          this.mode = 2;  //. 乗降モードに切り替え
          this.buttons[this.floor-1] = 0;
        }
      }else{
      }
      break;
    case 2: //. 乗降モード
      this.stop_count ++;
      if( this.stop_count == this.stop_second ){
        //. 乗降完了
        this.stop_count = 0;
        //this.buttons[this.floor-1] = 0;

        //. 次の目的方向を決める
        if( this.updown == 1 ){
          //. 現在上向き
          var b = false;
          for( var i = this.floor + 1; i < this.max_floor && !b; i ++ ){
            if( this.buttons[i] == 1 ){
              //. 現在よりも上の階のボタンが押されている
              b = true;
            }
          }
          if( b ){
            //. そのまま上向きに移動
            this.mode = 1;
          }else{
            //. 下階のボタンが押されている可能性は？
            for( var i = 0; i < this.floor && !b; i ++ ){
              if( this.buttons[i] == 1 ){
                //. 現在よりも下の階のボタンが押されている
                b = true;
              }
            }
            if( b ){
              //. 下向きに移動
              this.updown = -1;
              this.mode = 1;
            }else{
              //. 停止モード
              this.mode = 0;
            }
          }
        }else if( this.updown == -1 ){
          //. 現在下向き
          var b = false;
          for( var i = 0; i < this.floor && !b; i ++ ){
            if( this.buttons[i] == 1 ){
              b = true;
            }
          }
          if( b ){
            //. そのまま下向きに移動
            this.mode = 1;
          }else{
            //. 上階のボタンが押されている可能性は？
            for( var i = this.floor + 1; i < this.max_floor && !b; i ++ ){
              if( this.buttons[i] == 1 ){
                //. 現在よりも上の階のボタンが押されている
                b = true;
              }
            }
            if( b ){
              //. 上向きに移動
              this.updown = 1;
              this.mode = 1;
            }else{
              //. 停止モード
              this.mode = 0;
            }
          }
        }
      }else{
      }
      break;
    }
  }
}

var elevators = [];
function sim_start_elevators( settings ){
  for( var i = 0; i < settings.num; i ++ ){
    var elev = new elevator( i, settings.max_floor, settings.limit, settings.move_second, settings.stop_second );
    elevators.push( elev );
  }
}

function getElevatorsStatus(){
  var status = [];
  for( var i = 0; i < elevators.length; i ++ ){
    var elev = elevators[i];
    var s = {
      num: elev.num,
      floor: elev.floor,
      updown: elev.updown,
      people: elev.people,
      move_count: elev.move_count,
      stop_count: elev.stop_count,
      buttons: elev.buttons,
      mode: elev.mode
    };
    status.push( s );
  }

  return status;
}

function goFloor( idx, floor ){
  if( 0 <= idx && idx < elevators.length ){
    elevators[idx].goFloor( floor );
  }
}


//. floor
class floor{
  constructor( f ){
    this.floor = f;
    this.up = false;
    this.down = false;
  }

  //. 現在の状態
  getStatus(){
    var status = {
      floor: this.floor,
      up: this.up,
      down: this.down
    };
    return status;
  }
}

var floors = [];
function sim_start_floors( settings ){
  for( var i = 0; i < settings.max_floor; i ++ ){
    var f = new floor( i + 1 );
    floors.push( f );
  }
}


//. person
class person{
  constructor( src_floor, dst_floor, waitsec ){
    this.src_floor = src_floor;
    this.dst_floor = dst_floor;
    this.waitsec = ( waitsec ? waitsec : 0 );
    this.mode = 0;          //. 0:乗車待ち, 1:乗車中, 2: 到着
  }

  //. 現在の状態
  getStatus(){
    var status = {
      waitsec: this.waitsec,
      mode: this.mode
    };
    return status;
  }

  //. 上下ボタンを押す
  pushButton(){
    if( this.src_floor < this.dst_floor ){
      //. 上ボタン
      floors[this.src_floor-1].up = true;
      fireButton( this.src_floor, 1 );
    }else if( this.src_floor > this.dst_floor ){
      //. 下ボタン
      floors[this.src_floor-1].down = true;
      fireButton( this.src_floor, -1 );
    }
  }

  fireButton( floor, updown ){
    console.log( 'floor: ' + floor + ' - ' + updown );
  }
}


var people_by_floor = [];
function sim_start_people( settings ){
  for( var i = 0; i < settings.max_floor; i ++ ){
    people_by_floor[i] = [ [], [] ]; //. 0:下, 1:上
  }
}


var sec = 0;
var max_wait = max_process = sum_wait = sum_process = 0;
var people_num = waiting_queue.length;
function oneSecond(){
  //. １秒経過
  sec ++;
  fireOneSecond( sec );

  //. エレベータ前で待っている人の待ち時間を更新
  people_by_floor.forEach( function( people_in_floor ){
    people_in_floor[0].forEach( function( p ){
      p.waitsec ++;
    });
    people_in_floor[1].forEach( function( p ){
      p.waitsec ++;
    });
  });

  /*
  //. エレベータ前にやってくる人
  while( waiting_queue.length > 0 && waiting_queue[0].sec <= sec ){
    var w = waiting_queue.shift();
    var p = new person( w.src, w.dst );
    if( w.src < w.dst ){
      //. 上の階に向かおうとする人がやってきた
      floors[w.src-1].up = true;
      people_by_floor[w.src-1][1].push( p );
      fireCallButtonPush( w.src, 1 );
    }else{
      //. 下の階に向かおうとする人がやってきた
      floors[w.src-1].down = true;
      people_by_floor[w.src-1][0].push( p );
      fireCallButtonPush( w.src, -1 );
    }
  }
  */

  //. エレベータの挙動を更新
  elevators.forEach( function( elev ){
    elev.oneSecondLater();
  });

  //. エレベータが乗客の目的階に到達したら降りる
  for( var j = 0; j < elevators.length; j ++ ){
    var elev = elevators[j];
    if( elev.mode == 2 ){
      elev.offPeople();
    }
  }

  //. 待っている人のフロアに空きエレベータが止まっていれば乗車する
  for( var i = 0; i < people_by_floor.length; i ++ ){
    var people_in_floor = people_by_floor[i];

    if( people_in_floor[0].length > 0 ){
      for( var j = 0; j < elevators.length; j ++ ){
        var elev = elevators[j];
        if( people_in_floor[0].length > 0 && elev.floor == ( i + 1 ) && ( elev.updown == 0 || elev.updown == -1 ) && elev.people.length < elev.limit ){
          var p_array = elev.addPeople( people_in_floor[0] );
          people_in_floor[0] = p_array;
        }
      }
    }
    if( people_in_floor[1].length > 0 ){
      for( var j = 0; j < elevators.length; j ++ ){
        var elev = elevators[j];
        if( people_in_floor[1].length > 0 && elev.floor == ( i + 1 ) && ( elev.updown == 0 || elev.updown == 1 ) && elev.people.length < elev.limit ){
          var p_array = elev.addPeople( people_in_floor[1] );
          people_in_floor[1] = p_array;
        }
      }
    }
  }

  //. エレベータ前にやってくる人
  while( waiting_queue.length > 0 && waiting_queue[0].sec <= sec ){
    var w = waiting_queue.shift();
    var p = new person( w.src, w.dst );
    if( w.src < w.dst ){
      //. 上の階に向かおうとする人がやってきた
      floors[w.src-1].up = true;
      people_by_floor[w.src-1][1].push( p );
      fireCallButtonPush( w.src, 1 );
    }else{
      //. 下の階に向かおうとする人がやってきた
      floors[w.src-1].down = true;
      people_by_floor[w.src-1][0].push( p );
      fireCallButtonPush( w.src, -1 );
    }
  }

  //. 画面更新
  showCurrentStatus();

  //. 終了チェック
  if( checkCompleted() ){
    clearInterval( timer );
  }
}



//. simulator
function getSettings(){
  var settings = {
    num: parseInt( $('#prop_num').val() ),                  //. エレベーターの基数
    max_floor: parseInt( $('#prop_max_floor').val() ),      //. ビルのフロア数
    limit: parseInt( $('#prop_limit').val() ),              //. エレベーター１基の定員
    move_second: parseInt( $('#prop_move_second').val() ),  //. エレベーターが１フロア移動するのに必要な秒数
    stop_second: parseInt( $('#prop_stop_second').val() )   //. エレベーターが乗降のため停止して、再び動き出すまでの秒数
  };

  return settings;
}

var timer = -1;
function sim_start(){
  var settings = getSettings();

  //. 画面作成
  for( var i = 0; i < settings.num; i ++ ){
    $('#sim_table_thead_tr').append( '<td>Elevator ' + ( i + 1 ) + '</td>' );
  }
  //for( var j = settings.max_floor; j > 0; j -- ){
  for( var j = settings.max_floor; j >= 0; j -- ){    //. デバッグ領域として j = 0 を追加
    var tr = '<tr id="sim_table_tbody_tr_' + j + '">'
      + '<td id="sim_table_tbody_' + j + '_floor">' + ( j == 0 ? '#' : j ) + '</td>'
      + '<td id="sim_table_tbody_' + j + '_waiting">'
      + '<span id="sim_table_tbody_' + j + '_waiting_up" class="waiting_up">0</span><br/>'
      + '<span id="sim_table_tbody_' + j + '_waiting_down" class="waiting_down">0</span>'
      + '</td>'
      + '</tr>';
    $('#sim_table_tbody').append( tr );
    for( var i = 0; i < settings.num; i ++ ){
      $('#sim_table_tbody_tr_'+j).append( '<td id="sim_table_tbody_' + j + '_elevator_' + i + '">' + j + '-' + i + '</td>' );
    }
  }

  //. 初期化
  sim_start_elevators( settings );
  sim_start_floors( settings );
  sim_start_people( settings );

  //. シミュレーションスタート
  timer = setInterval( oneSecond, 1000 );
}

function checkCompleted(){
  var r = false;

  if( waiting_queue.length == 0 ){
    var n = 0;
    for( var j = people_by_floor.length; j > 0; j -- ){
      var people_in_floor = people_by_floor[j-1];
      n += people_in_floor[0].length;
      n += people_in_floor[1].length;
    }

    if( n == 0 ){
      var m = 0;
      for( var i = 0; i < elevators.length; i ++ ){
        var elev = elevators[i];
        m += elev.people.length;
      }

      if( m == 0 ){
        //. 終了時の処理
        $('#sec').addClass( 'completed' );

        var msg = 'sec: ' + sec + '\n'
          + 'max_wait: ' + max_wait + '\n'
          + 'avg_wait: ' + ( sum_wait / people_num ) + '\n'
          + 'max_process: ' + max_process + '\n'
          + 'avg_process: ' + ( sum_process / people_num );
        //alert( msg );
        $('#result_sec').html( sec );
        $('#result_max_wait').html( max_wait );
        $('#result_avg_wait').html( ( sum_wait / people_num ) );
        $('#result_max_process').html( max_process );
        $('#result_avg_process').html( ( sum_process / people_num ) );
        $('#resultModal').modal();

        r = true;
      }
    }
  }

  return r;
}

function showCurrentStatus(){
  var settings = getSettings();

  //. テーブル内のエレベータを全消し
  //for( var j = settings.max_floor; j > 0; j -- ){
  for( var j = settings.max_floor; j >= 0; j -- ){
    for( var i = 0; i < settings.num; i ++ ){
      $('#sim_table_tbody_'+j+'_elevator_'+i).html( '' );
    }
  }

  //. 経過秒
  $('#sec').html( sec );

  //. 各エレベータの位置を更新
  elevators.forEach( function( elev ){
    var status = elev.getStatus();
    //console.log( status );
    //. { num: 1, floor: 1, mode: 0, updown: 0, people: [], buttons:[], move_count: 0, stop_count: 0 }

    var elev_div = '<div class="elevator_' + ( status.updown == 1 ? 'up' : ( status.updown == -1 ? 'down' : 'stop' ) ) + '">' + status.people.length + '</div>';
    $('#sim_table_tbody_'+status.floor+'_elevator_'+status.num).html( elev_div );
  });

  //. 各階で待っている人の数を更新
  for( var j = people_by_floor.length; j > 0; j -- ){
    var people_in_floor = people_by_floor[j-1];
    var people_num_down = people_in_floor[0].length;
    var people_num_up = people_in_floor[1].length;
    $('#sim_table_tbody_' + j + '_waiting_down').html( people_num_down );
    $('#sim_table_tbody_' + j + '_waiting_up').html( people_num_up );
  }

  //. デバッグ情報
  var people_num_down = people_num_up = 0;
  for( var j = people_by_floor.length; j > 0; j -- ){
    var people_in_floor = people_by_floor[j-1];
    people_num_down += people_in_floor[0].length;
    people_num_up += people_in_floor[1].length;
  }
  $('#sim_table_tbody_0_waiting_down').html( people_num_down );
  $('#sim_table_tbody_0_waiting_up').html( people_num_up );
  elevators.forEach( function( elev ){
    var people = elev.people;
    var debug_elev = '';
    people.forEach( function( p ){
      var line = p.src_floor + ' -> ' + p.dst_floor + '<br/>';
      debug_elev += line;
    });
    $('#sim_table_tbody_0_elevator_' + elev.num).html( debug_elev );
  });
}

function start(){
  $('#config_panel').css( 'display', 'none' );
  $('#sim_panel').css( 'display', 'block' );
  sim_start();
}


//. 画面の初期化
$(function(){
  //. エレベーター設定
  $('#prop_num').val( default_settings.num );
  $('#prop_max_floor').val( default_settings.max_floor );
  $('#prop_limit').val( default_settings.limit );
  $('#prop_move_second').val( default_settings.move_second );
  $('#prop_stop_second').val( default_settings.stop_second );

  //. 待ち行列
  waiting_queue.forEach( function( q ){
    var tr = '<tr>'
      + '<td>' + q.sec + '</td>'
      + '<td>' + q.src + '</td>'
      + '<td>' + q.dst + '</td>'
      + '</tr>';
    $('#wating_queue_table_tbody').append( tr );
  });
});
