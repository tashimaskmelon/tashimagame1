//=============================================================================
// RelativeMovePicture.js
// ----------------------------------------------------------------------------
// <利用規約>
//  利用はRPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
//  商用、非商用、ゲームの内容を問わず利用可能です。
//  ゲームへの利用の際、報告や出典元の記載等は必須ではありません。
//  二次配布や転載は禁止します。
//  ソースコードURL、ダウンロードURLへの直接リンクも禁止します。
//  不具合対応以外のサポートやリクエストは受け付けておりません。
//  スクリプト利用により生じたいかなる問題においても、一切責任を負いかねます。
// ----------------------------------------------------------------------------
//  Ver1.00  2016/01/12  初版
//=============================================================================

/*:
 * @plugindesc イベントコマンドの「ピクチャの移動」を、相対座標指定で行えるようにします。
 * @author こま
 *
 * @help プラグインコマンド
 *   RMP_ON          「ピクチャの移動」が相対座標指定になります。
 *   RMP_ON_ONCE     次に実行した「ピクチャの移動」のみ、相対座標指定になります。
 *   RMP_OFF         「ピクチャの移動」が絶対座標指定（通常）になります。
 */

(function(){
    var relative = false;
    var once = false;

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call (this, command, args);
        switch (command) {
        case 'RMP_ON' :
            relative = true;
            once = false;
            break;
        case 'RMP_ON_ONCE' :
            relative = true;
            once = true;
            break;
        case 'RMP_OFF' :
            relative = false;
            break;
        }
    }

    var _Game_Picture_move = Game_Picture.prototype.move;
    Game_Picture.prototype.move = function(origin, x, y, scaleX, scaleY, opacity, blendMode, duration) {
        if (relative) {
            x += this.x();
            y += this.y();
            relative = !once;
        }
        _Game_Picture_move.call (this, origin, x, y, scaleX, scaleY, opacity, blendMode, duration);
    };
}());
