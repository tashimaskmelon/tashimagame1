//=============================================================================
// イベント接触判定カスタマイズ　Ver1.00
/*:
@plugindesc イベント接触判定カスタマイズプラグイン
@author 摘草 http:re-wind.org/
@help 通常、イベント起動条件が「プレイヤーから接触」「イベントから接触」となっている
イベントは決定キーで隣のマスからも起動できてしまいますが、
それを無効化するプラグインです。
ゲーム中から変数t_ev_trigを操作することで設定の随時変更も恐らく可能（未確認）。
ファイル名を変更すると正常に動作しません。ファイル名を変える場合は
「EVtrig_Custum」部分を任意のファイル名に書き換えてください。

パラメータの値を変更することで下記のように動作します。

↓パラメータの値
0：プレイヤーから接触＆イベントから接触の両方無効
1：イベントから接触のみ無効
2：プレイヤーから接触のみ無効
3：無効化しない
@param t_ev_trig
@desc 0:プレイヤーから接触＆イベントから接触　1:イベントから接触のみ　2:プレイヤーから接触のみ　3:無効化しない（デフォルト）
@default 0

*/
//=============================================================================

(function() {

   var parameters = PluginManager.parameters('EVtrig_Custum');
   var t_ev_trig = String(parameters['t_ev_trig']);
   var t_ev_trig_type = String(parameters['t_ev_trig_type']);

//分岐

   	if (t_ev_trig == 0) {
   	t_ev_trig_type = '[0]';
  	} else if (t_ev_trig == 1){
   	t_ev_trig_type = '[0,1]';
   	} else if (t_ev_trig == 2){
  	t_ev_trig_type = '[0,2]';
   	} else if (t_ev_trig == 3){
  	t_ev_trig_type = '[0,1,2]';
   }
   
//分岐ここまで

Game_Player.prototype.triggerButtonAction = function() {

    if (Input.isTriggered('ok')) {
        if (this.getOnOffVehicle()) {
            return true;
        }
        this.checkEventTriggerHere([0]);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
        this.checkEventTriggerThere(t_ev_trig_type);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
    }
    return false;
};

})();