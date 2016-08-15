//=============================================================================
// MoveAnime2.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc アニメーションを飛ばすプラグイン 2
 * @author Trb
 * 
 * @version 1.0(2.0)  2016 4/22 前Move_anime.jsから大きく改変したため別プラグインとしました
 *          1.1       2016 7/ 4 アニメーションの表示位置が[頭上]、[中心]だった時、アニメーションの始点がおかしくなる不具合を修正
 * 
 * 
 * @help アニメーションを使用者から相手へ向かって飛ばすことができます。
 * 設定方法はスキルのメモ欄に書く方法とスクリプトコマンドで設定する方法の2種類があります。
 * 
 * ----設定方法1----
 * スキルのメモ欄に
 * <move: a>
 * <arc: b>
 * <deflection: c>
 * <repeat: d>
 * と書いて下さい。(a,b,c,dにはそれぞれ任意の数字を記入)
 * moveの設定は必須ですが、それ以外は不要なら無記入でも大丈夫です。
 * 
 * <move:a>
 *   アニメーションの移動に掛けるフレーム数です。
 *   （10フレーム掛けて飛ばしたければ <move:10> と書きます）
 * 
 * <arc:b>
 *   この値を設定すると、bの高さの放物線の軌道で飛んでいきます。
 *   （arc:1 = 標準解像度で1ピクセルです）
 * 
 * <deflection:c>
 *   この値を設定すると、arcの値にプラスマイナスcの乱数が加算されます。
 *   (<arc:50> <deflection:100> と書くと実際のarc値は -50～150 の幅になる)
 *   多段ヒットの技にこの設定を適用することで乱れ撃ちのようになります。
 * 
 * <repeat:d>
 *   この値を設定すると、同じアニメーションをd回繰り返し再生します。
 *   これはYEP_BattleCoreを入れると連続攻撃時にアニメーションが1回しか表示されない問題に
 *   対応するために追加した機能であり、
 *   これ単体で使うと本来の再生回数*d回再生されるようになってしまうので注意して下さい。
 * 
 * 
 * ----設定方法2----
 * スクリプトコマンド：setParams(アニメーションID,move値,arc値,deflection値)
 * で、アニメーションIDを指定してパラメータを設定できます。
 * イベントコマンドや別プラグインで表示させるアニメーション、フィールドでのアニメーションなど、
 * スキルのメモ欄で設定できないものはこちらを使って下さい。
 * 
 * 例 ID5番のアニメを10フレームで飛ばせるようにしたい場合
 * 		setParams(5,10) というように書く
 *  (こちらもメモ欄と同じように、arc値、deflection値は不要なら省略出来ます)
 * 
 * 一度設定したら別の値で上書きしない限り有効なので、ゲームの開始時に
 * イベントでまとめて設定しておくと便利です。
 * ただし保存用の変数を設定していないとセーブデータに保存されません。
 * 
 * 
 * ==============================================================
 * 
 * ----その他機能----
 * 
 * setStartPosition(アニメーションID,x,y)
 *   この値を設定すると、アニメーションの開始位置がスキルの使用者ではなく
 *   指定した座標になります。
 *   
 * 
 *   例 ID10番のアニメを(100,200)の座標から飛ばすようにする
 *       setParams_sp(10,100,200)
 * 
 * 
 * clearParams(アニメーションID)
 *   指定したアニメーションIDの設定を全てリセットします。
 * 
 * 
 * 
 * @param use_field
 * @desc フィールド上でもアニメーションを飛ばせるようにするか
 * フィールドで使わない･･･false  使う･･･true
 * @default false
 * 
 * @param variable
 * @desc setParamsで設定した値を保存する変数番号。
 * 0だと保存されません。
 * @default 0
 * 
 * 
 */
(function () {
	
	var parameters = PluginManager.parameters('MoveAnime2');
	var UseField = String(parameters['use_field']);
	var Variable = parameters['variable'];
	
	var params = [];
	var subjectX = 0;//使用者の座標
	var subjectY = 0;
	//paramsの中身
	var moveDuration = 0, arcRate = 1,deflection = 2,repeats = 3,startX = 4,startY = 5;

//各設定値の代入用関数
	setParams = function(id,move,arc,def,rep){
		id = Math.max(id,0);
		if(!params[id])params[id] = [];
		params[id][moveDuration] = move || 0;
		params[id][arcRate] = arc || 0;
		params[id][deflection] = def || 0;
		params[id][repeats] = rep || 0;
	};

	setStartPosition = function(id,a,b){
		if(!params[id])params[id] = [];
		params[id][startX] = a;
		params[id][startY] = b;
	};

	clearParams = function(id){
		params[id] = [];
	};



	var SBu = Sprite_Battler.prototype.update;
	Sprite_Battler.prototype.update = function() {
		SBu.call(this);
		//行動中のキャラの座標を取得する
		if(this._battler != null && this._battler.isActing()){
			if(!$gameSystem.isSideView() && this._actor){
				//フロントビューの場合
				subjectX = Graphics.boxWidth / 2;
				subjectY = Graphics.boxHeight * 0.8;				
			}else{
				subjectX = this.x;
				subjectY = this.y;
			}
		}
		
	};
	
	var WBsa = Window_BattleLog.prototype.startAction;
	Window_BattleLog.prototype.startAction = function(subject, action, targets) {
		var item = action.item();
		if(Number(item.meta.move)>0){//スキルのメモにムーブ値が設定されていたら代入
			setParams(item.animationId,Number(item.meta.move),Number(item.meta.arc) || 0,
				Number(item.meta.deflection) || 0,Number(item.meta.repeat) || 0);
		}
		WBsa.call(this,subject, action, targets);
	};

	
	Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
		var animation = $dataAnimations[animationId];
		if (animation) {
			var delay = this.animationBaseDelay();
			var nextDelay = this.animationNextDelay();
			targets.forEach(function(target) {
				target.startAnimation(animationId, mirror, delay);
				delay += nextDelay;
				var repeat = params[animationId] ? params[animationId][repeats] : 0;
				while(repeat > 0 ){//repeat値の分アニメーションを繰り返す処理を追加
					target.startAnimation(animationId, mirror, delay);
					delay += nextDelay;
					repeat -= 1;
				}
			});
		}
	};


	var SAim = Sprite_Animation.prototype.initMembers;
	Sprite_Animation.prototype.initMembers = function() {
		SAim.call(this);
		this._x2 = 0;
		this._y2 = 0;
		this._duration2 = 0;
		this._arcRate = 0;
		this._arc = 0;
	};

	//アニメーションのセットアップ時に各パラメータを代入
	var SAs = Sprite_Animation.prototype.setup;
	Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
		if(params[animation.id] ){
			var prm = params[animation.id];
			if(prm[startX]){//startXが設定されてる場合はその値
				var sx = mirror ? Graphics.boxWidth - prm[startX] : prm[startX];
			}else{//そうでない場合は技使用者の座標
				sx = $gameParty.inBattle() ? subjectX : $gamePlayer.screenX();
			}
			if(prm[startY]){
				var sy = prm[startY];
			}else{
				sy = $gameParty.inBattle() ? subjectY : $gamePlayer.screenY();
			}
			
			if($gameParty.inBattle()){//戦闘時
				var t =target._battler ? target : target.parent;
				var pos = animation.position;//アニメーションのポジションに応じて位置補正を加える（ver.1.1修正箇所）
				this._x2 = sx - t.x;
				this._y2 = sy - t.y - t.height * (pos - 2) / 2;//

			}else if(UseField == 'true'){//フィールド時
				this._x2 = sx - target.x;
				this._y2 = sy - target.y;

			}
			this._duration2 = prm[moveDuration];
			this._arc = this._duration2;
			this._arcRate = prm[arcRate] + (Math.random() - 0.5) * prm[deflection] * 2;

		}
		SAs.call(this,target, animation, mirror, delay);
	};
	
	//上で代入した値を元に位置補正を加える
	var SAup = Sprite_Animation.prototype.updatePosition;
	Sprite_Animation.prototype.updatePosition = function() {
		SAup.call(this);
		//表示位置補正の計算
		if(this._duration2 > 0){
			this._x2 -= this._x2/this._duration2;
			this._y2 -= this._y2/this._duration2;
			this.x += this._x2;
			this.y += this._y2 - Math.sin(this._duration2 / this._arc * Math.PI) * this._arcRate;
			this._duration2 -= 1;
		}
	};


	//セーブ時にparamsを変数に入れる
	var SSof = Scene_Save.prototype.onSavefileOk;
	Scene_Save.prototype.onSavefileOk = function() {
		if(Variable > 0){
			$gameVariables._data[Variable] = params.clone();
		}
		SSof.call(this);
	};

	//ロード時にparamsに移す
	var SLol = Scene_Load.prototype.onLoadSuccess;
	Scene_Load.prototype.onLoadSuccess = function() {
		if(Variable > 0){
			try{
				params = $gameVariables._data[Variable].clone();
			}
			catch(e){}
		}
		SLol.call(this);
	};



})();