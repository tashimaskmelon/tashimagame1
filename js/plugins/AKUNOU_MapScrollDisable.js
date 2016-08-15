//=============================================================================
// AKUNOU_MapScrollDisable.js
// Version: 0.90
// ----------------------------------------------------------------------------
// 河原 つつみ
// 連絡先 ：『アクマの脳髄』http://www.akunou.com/
//=============================================================================

/*:
 * @plugindesc プレイヤーキャラの移動に同期した画面スクロールを、一時的に無効にするプラグインコマンドを追加します。
 * @author Tsutumi Kawahara
 * @help
 * プラグインコマンド:
 *   MapScrollDisable 0 # プレイヤー移動によるマップスクロールを許可(初期値)
 *   MapScrollDisable 1 # プレイヤー移動によるマップスクロールを禁止
 */

(function() {

    //-------------------------------------------------------------------------
    // Game_System
    //-------------------------------------------------------------------------

    var akunou3_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        akunou3_initialize.call(this);
        this._mapscrollEnabled = true;
    }

    Game_System.prototype.ismapscrollEnabled = function() {
        return this._mapscrollEnabled;
    };

    Game_System.prototype.disableMapScroll = function() {
        this._mapscrollEnabled = false;
    };

    Game_System.prototype.enableMapScroll = function() {
        this._mapscrollEnabled = true;
    };
    
    //-------------------------------------------------------------------------
    // Game_Player
    //-------------------------------------------------------------------------
    
    Game_Player.prototype.update = function(sceneActive) {
        var lastScrolledX = this.scrolledX();
        var lastScrolledY = this.scrolledY();
        var wasMoving = this.isMoving();
        this.updateDashing();
        if (sceneActive) {
            this.moveByInput();
        }
        Game_Character.prototype.update.call(this);
        if ($gameSystem.ismapscrollEnabled()) {
            this.updateScroll(lastScrolledX, lastScrolledY);
        }
        this.updateVehicle();
        if (!this.isMoving()) {
            this.updateNonmoving(wasMoving);
        }
        this._followers.update();
    };

    //-------------------------------------------------------------------------
    // Game_Interpreter
    //-------------------------------------------------------------------------

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MapScrollDisable') {
            if (Number(args[0]) === 0) {
                $gameSystem.enableMapScroll();
            } else {
                $gameSystem.disableMapScroll();
            }
        }
    };

})();
