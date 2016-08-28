//=============================================================================
// Tileanimation_speed_riru.js
//=============================================================================
/*:
 * @plugindesc タイルA1のアニメーションの速度を地形タグごとに変更します
 * @author riru
 *
 * @help 
 *＜使い方＞
 *速さを変えたいタイルの地形タグを0以外にし、タイルセットのメモ欄に以下のように記述します
 *速さは数字が大きいほど遅く、小さいほどはやくなります
 *複数設定する場合は:で区切ってください
 *<Tileani_speed:地形タグ番号,速さ:地形タグ番号,速さ…>
 *使用例：<Tileani_speed:2,5:3,100>
 *
 *
 * ＜規約＞
 * 有償無償問わず使用できます。改変もご自由にどうぞ。仕様報告もいりません。２次配布はだめです
 *著作権は放棄していません。使用する場合は以下の作者とURLをreadmeなどどこかに記載してください
 *
 * ＜作者情報＞
 *作者：riru 
 *HP：ガラス細工の夢幻
 *URL：http://garasuzaikunomugen.web.fc2.com/index.html
 * ＜更新情報＞
 *2016/2/4　Ver1.01。イベントテスト時にエラーが起きるバグを修正。
 */
(function() {
//riru再定義箇所。
Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
    var tableEdgeVirtualId = 10000;
    var mx = startX + x;
    var my = startY + y;
    var dx = (mx * this._tileWidth).mod(this._layerWidth);
    var dy = (my * this._tileHeight).mod(this._layerHeight);
    var lx = dx / this._tileWidth;
    var ly = dy / this._tileHeight;
    var tileId0 = this._readMapData(mx, my, 0);
    var tileId1 = this._readMapData(mx, my, 1);
    var tileId2 = this._readMapData(mx, my, 2);
    var tileId3 = this._readMapData(mx, my, 3);
    var shadowBits = this._readMapData(mx, my, 4);
    var upperTileId1 = this._readMapData(mx, my - 1, 1);
    var lowerTiles = [];
    var upperTiles = [];

    if (this._isHigherTile(tileId0)) {
        upperTiles.push(tileId0);
    } else {
        lowerTiles.push(tileId0);
    }
    if (this._isHigherTile(tileId1)) {
        upperTiles.push(tileId1);
    } else {
        lowerTiles.push(tileId1);
    }

    lowerTiles.push(-shadowBits);

    if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
        if (!Tilemap.isShadowingTile(tileId0)) {
            lowerTiles.push(tableEdgeVirtualId + upperTileId1);
        }
    }

    if (this._isOverpassPosition(mx, my)) {
        upperTiles.push(tileId2);
        upperTiles.push(tileId3);
    } else {
        if (this._isHigherTile(tileId2)) {
            upperTiles.push(tileId2);
        } else {
            lowerTiles.push(tileId2);
        }
        if (this._isHigherTile(tileId3)) {
            upperTiles.push(tileId3);
        } else {
            lowerTiles.push(tileId3);
        }
    }
    var count = 1000 + this.animationCount - my;
        //riru改造箇所
     if ($dataTilesets[$gameMap._tilesetId] && $dataTilesets[$gameMap._tilesetId].meta.Tileani_speed){
       var speed_ar = $dataTilesets[$gameMap._tilesetId].meta.Tileani_speed.split(":"); 
       for (var i = 0; i < speed_ar.length; i++) {   
         speed_ar[i] = speed_ar[i].split(",");
         this._readMapData(mx, my, 0)
         if (speed_ar[i] != null && $gameMap.terrainTag(mx, my) == Number(speed_ar[i][0])){
           var a_speed = Number(speed_ar[i][1]);
           var frameUpdated = (count % a_speed === 0);
           this._animationFrame = Math.floor(count / a_speed);
         }else if(!frameUpdated){
           var frameUpdated = (count % 30 === 0);
           this._animationFrame = Math.floor(count / 30);
         }
      }
    }else{
      var frameUpdated = (count % 30 === 0);
      this._animationFrame = Math.floor(count / 30);
    }
    //riru改造箇所おわり  
    var lastLowerTiles = this._readLastTiles(0, lx, ly);
    if (!lowerTiles.equals(lastLowerTiles) ||
            (Tilemap.isTileA1(tileId0) && frameUpdated)) {
        this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
        for (var i = 0; i < lowerTiles.length; i++) {
            var lowerTileId = lowerTiles[i];
            if (lowerTileId < 0) {
                this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
            } else if (lowerTileId >= tableEdgeVirtualId) {
                this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
            } else {
                this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
            }
        }
        this._writeLastTiles(0, lx, ly, lowerTiles);
    }

    var lastUpperTiles = this._readLastTiles(1, lx, ly);
    if (!upperTiles.equals(lastUpperTiles)) {
        this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
        for (var j = 0; j < upperTiles.length; j++) {
            this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
        }
        this._writeLastTiles(1, lx, ly, upperTiles);
    }
};
})();

