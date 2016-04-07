import {Calc} from './../utils/Calculator';
import {ResizeUI} from './../ui/ResizeUI';
import {RotateUI} from './../ui/RotateUI';
import {MoveUI} from './../ui/MoveUI';
import {ImageUI} from './../ui/ImageUI';
import {KeyCode} from './../const/KeyCode';
import {Painter} from './../utils/Painter';


export class Cropper extends PIXI.Container {
    constructor(canvas, imageElement) {
        super();
        this.initialize(canvas, imageElement);
        this.addEvent();
    }

    initialize(canvas, imageElement) {
        this.paddingX = 216;
        this.paddingY = 158;
        this.canvas = canvas;
        this.isInitialize = false;
        this.imageElement = imageElement;
        this.maxRotation = Calc.toRadians(45);
        this.minRotation = -this.maxRotation;

        this.image = new ImageUI(this.imageElement);
        this.rotateUI = new RotateUI(this.canvas);
        this.moveUI = new MoveUI(this.canvas);
        this.resizeUI = new ResizeUI(this.canvas);
        this.addChild(this.image);
        this.addChild(this.rotateUI);
        this.addChild(this.moveUI);
        this.addChild(this.resizeUI);

        this.gGrid = new PIXI.Graphics();
        this.gLine = new PIXI.Graphics();
        this.gLens = new PIXI.Graphics();
        this.gImage = new PIXI.Graphics();
        this.gBounds = new PIXI.Graphics();
        this.gRotate = new PIXI.Graphics();
        this.addChild(this.gLens);
        this.addChild(this.gLine);
        this.addChild(this.gGrid);
        this.addChild(this.gImage);
        this.addChild(this.gBounds);
        this.addChild(this.gRotate);
    }

    addEvent() {
        window.document.addEventListener('keyup', (e) => {
            switch (e.keyCode) {
                case KeyCode.ESC:
                    console.clear();
                    break;
                case KeyCode.SPACE:
                    console.log(this.image.toString());
                    break;
            }
        });

        this.moveUI.on('moveStart', this.moveStart.bind(this));
        this.moveUI.on('moveChange', this.moveChange.bind(this));
        this.moveUI.on('moveEnd', this.moveEnd.bind(this));
        this.rotateUI.on('rotateStart', this.rotateStart.bind(this));
        this.rotateUI.on('rotateChange', this.rotateChange.bind(this));
        this.rotateUI.on('rotateEnd', this.rotateEnd.bind(this));
        this.rotateUI.on('rotateStart', this.rotateStart.bind(this));
        this.resizeUI.on('cornerResizeStart', this.cornerResizeStart.bind(this));
        this.resizeUI.on('cornerResizeChange', this.cornerResizeChange.bind(this));
        this.resizeUI.on('cornerResizeEnd', this.cornerResizeEnd.bind(this));
    }

    update() {
    }

    resize() {
        var bounds = this.bounds;
        this.cw = this.canvas.width;
        this.ch = this.canvas.height;
        this.cx = this.cw / 2;
        this.cy = this.ch / 2;

        // 최초 실행: 화면 초기화
        if (this.isInitialize == false) {
            this.isInitialize = true;
            this.resizeImage(bounds, this.image);
            var imageBounds = this.image.bounds;
            this.resizeUI.resize(imageBounds);
            this.moveUI.setSize(imageBounds);

            this.test();
        } else {
            var resizeUIBounds = this.resizeUI.bounds;
            this.magnifyImage(resizeUIBounds);
            this.moveUI.setSize(resizeUIBounds);
        }

        this.rotateUI.resize();
        this.imagePoints = this.image.points;
        Painter.drawBounds(this.gBounds, bounds);

        this.gImage.clear();
        this.gRotate.clear();
    }

    test() {
        //this.image.visible = false;
        //this.resizeUI.visible = false;
        //this.moveUI.visible = false;
        //this.gBounds.visible = false;
        //Painter.drawGrid(this.gGrid, this.canvas.width, this.canvas.height);
    }

    resizeImage() {
        var size = Calc.getImageSizeKeepAspectRatio(this.image, this.bounds);
        this.image.width = size.width;
        this.image.height = size.height;
        this.image.x = this.cx;
        this.image.y = this.cy;
    }

    /**
     * 1. 줌 비율 구하기
     * 2. 러버밴드 리사이즈 구하기
     * 3. 러버밴드 설정
     * 4. 줌 비율에 이미지 리사이즈 하기
     * 5. 이미지 위치 구하기
     * 6. 이미지 위치 구할 때 러버밴드 리사이즈 후 위치를 기준 좌표로 삼으면 됩니다.
     * @param lens : 확대 / 축소 하기 위해 설정한 Rectangle
     */
    magnifyImage(lens) {
        var offsetX = this.image.lt.x - lens.x;
        var offsetY = this.image.lt.y - lens.y;

        var zoom = Calc.getBoundsScale(this.bounds, lens).min;
        var rubberband = Calc.getImageSizeKeepAspectRatio(lens, this.bounds);
        rubberband.x = this.canvas.width / 2 - rubberband.width / 2;
        rubberband.y = this.canvas.height / 2 - rubberband.height / 2;
        this.resizeUI.setSize(rubberband);

        this.image.width = this.image.width * zoom;
        this.image.height = this.image.height * zoom;

        var posX = offsetX * zoom;
        var posY = offsetY * zoom;
        var pivotOffsetX = this.image.x - this.image.lt.x;
        var pivotOffsetY = this.image.y - this.image.lt.y;
        this.image.x = rubberband.x + posX + pivotOffsetX;
        this.image.y = rubberband.y + posY + pivotOffsetY;
    }

    //////////////////////////////////////////////////////////////////////////
    // Event Handler
    //////////////////////////////////////////////////////////////////////////

    moveStart(e) {
        this.prevImageX = this.image.x;
        this.prevImageY = this.image.y;
    }

    moveChange(e) {
        this.image.x += e.change.x;
        this.image.y += e.change.y;

        if (this.image.isContainsBounds(this.resizeUI) === false) {
            if (this.image.isHitSide(this.resizeUI) === false) {
                var x = this.prevImageX + e.change.x * Math.cos(this.image.rotation);
                var y = this.prevImageY + e.change.x * Math.sin(this.image.rotation);
                this.image.x = x;
                this.image.y = y;
            } else {
                this.image.x = this.prevImageX;
                this.image.y = this.prevImageY;
            }
        }

        this.prevImageX = this.image.x;
        this.prevImageY = this.image.y;
    }

    moveEnd(e) {
        //
    }

    rotateStart(e) {
        //this.imagePoints = this.image.points;
    }

    rotateChange(e) {
        this.image.rotation += e.change;

        if (this.image.rotation < this.minRotation)
            this.image.rotation = this.minRotation;

        if (this.image.rotation > this.maxRotation)
            this.image.rotation = this.maxRotation;

        this.displayImageRotationBounds();

        if (this.image.isContainsBounds(this.resizeUI) === false) {
            var pivot = {x:this.image.x, y:this.image.y};
            var rotationPoints = Calc.getRotationRectanglePoints(pivot, this.imagePoints, Calc.toDegrees(this.image.rotation));
            var rotationRect = Calc.getBoundsRectangle(rotationPoints, 0);
            var scale = Calc.getBoundsScale(rotationRect, this.image);
            var sw = this.image.width * scale.max;
            var sh = this.image.height * scale.max;
            var maxImageSize = this.image.getImageMaxSize(this.bounds);
            var w = this.image.width;
            var h = this.image.height;

            /*console.log(
                'IMAGE WH[' +
                Calc.leadingZero(parseInt(this.image.width)) + ', ' +
                Calc.leadingZero(parseInt(this.image.height)) + '] ' +
                'SCALE WH[' +
                Calc.leadingZero(parseInt(sw)) + ', ' +
                Calc.leadingZero(parseInt(sh)) + ']' +
                'MAX WH[' +
                Calc.leadingZero(parseInt(maxImageSize.width)) + ', ' +
                Calc.leadingZero(parseInt(maxImageSize.height)) + ']'
            );*/

            // 이미지가 최대 사이즈 보다 작은 경우에만 스케일을 하도록 조건 변경 필요
            if (w < maxImageSize.width && h < maxImageSize.height && sw > w && sh > h) {
                this.image.width = sw;
                this.image.height = sh;
            }

            // 자주빛
            // Painter.drawBounds(this.gRotate, rotationRect, true, 1, 0xFF00FF, 0.7);

            var rotation = Calc.toDegrees(this.image.rotation);

            // 위로 회전
            if (rotation > 0) {
                if (this.resizeUI.isLtInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.lt, this.image.leftLine);

                if (this.resizeUI.isLbInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.lb, this.image.bottomLine);

                if (this.resizeUI.isRtInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.rt, this.image.topLine);

                if (this.resizeUI.isRbInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.rb, this.image.rightLine);

            } else {
                if (this.resizeUI.isLtInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.lt, this.image.topLine);

                if (this.resizeUI.isLbInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.lb, this.image.leftLine);

                if (this.resizeUI.isRtInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.rt, this.image.rightLine);

                if (this.resizeUI.isRbInsideBounds(this.image) === false)
                    Calc.moveToCollision(this.image, this.resizeUI.rb, this.image.bottomLine);
            }
        }
    }

    rotateEnd(e) {
        //
    }

    cornerResizeStart(e) {
        this.prevLensPoints = this.resizeUI.points;
        this.startLensBounds = this.resizeUI.bounds;
    }


    /*expandImage(lens, zoomBounds, dx, dy) {
        var offsetX = this.image.lt.x - lens.x;
        var offsetY = this.image.lt.y - lens.y;

        var zoom = Calc.getBoundsScale(this.bounds, lens).min;
        var rubberband = Calc.getImageSizeKeepAspectRatio(lens, this.bounds);
        rubberband.x = this.canvas.width / 2 - rubberband.width / 2;
        rubberband.y = this.canvas.height / 2 - rubberband.height / 2;
        this.resizeUI.setSize(rubberband);

        this.image.width = this.image.width * zoom;
        this.image.height = this.image.height * zoom;

        var posX = offsetX * zoom;
        var posY = offsetY * zoom;
        var pivotOffsetX = this.image.x - this.image.lt.x;
        var pivotOffsetY = this.image.y - this.image.lt.y;
        this.image.x = rubberband.x + posX + pivotOffsetX;
        this.image.y = rubberband.y + posY + pivotOffsetY;
    }*/


    expandImageCopy(corner, bounds, limit, lens, copyLens, dx, dy) {

        // offset 구하기
        // --------------------------------------------------------------------------
        var offsetX = this.image.lt.x - lens.x;
        var offsetY = this.image.lt.y - lens.y;
        // --------------------------------------------------------------------------

        var dw = (limit.width - lens.width);
        var dh = (limit.height - lens.height);

        var absdw = Math.abs(dw);
        var absdh = Math.abs(dh);

        var hdw = dw / 2;
        var hdh = dh / 2;


        var isExpandX = true;
        var isExpandY = false;

        // x로 확대되는지 y로 확대 되는지 구분 부터
        if(dh < dw) {
            isExpandX = false;
            isExpandY = true;
        }

        // 비율 구하기
        // --------------------------------------------------------------------------
        var zoom = Calc.getBoundsScale(limit, copyLens).min;
        // --------------------------------------------------------------------------

        var limitZoom = Calc.getBoundsScale(this.bounds, copyLens).min;

        zoom = (zoom < limitZoom) ? zoom : limitZoom;

        // resizeUI 설정
        // --------------------------------------------------------------------------
        var rubberband = Calc.getImageSizeKeepAspectRatio(lens, limit);
        // rubberband width, height 고려 사항
        // 넓이 또는 높이 둘 중 하나는 바운드에 맞추고 리사이즈 바운드만큼 모자른 부분(diffWidth, diffHeight)을 빼줘야 합니다.


        var rubberbandX = this.canvas.width / 2 - rubberband.width / 2;
        var rubberbandY = this.canvas.height / 2 - rubberband.height / 2;


        if(absdw > absdh) {
            // 넓이가 작고 높이가 높은 경우 (높이가 넘어 갔을 때)
            // 줌비율 구할 때 넓이를 꽉 채워 주자
            console.log('X Big', Calc.trace(dw), Calc.trace(dh));

            if(corner === this.resizeUI.rt || corner === this.resizeUI.rb) {
                rubberband.x = rubberbandX - hdw;
            } else {
                rubberband.x = rubberbandX + hdw;
            }

            rubberband.y = rubberbandY;
        } else {
            // 높이가 낮고 넓이가 넓은 경우 (넓이가 넘어 갔을 때)
            // 줌비율 구할 때 높이를 꽉 채워 주자
            console.log('Y Big', Calc.trace(dw), Calc.trace(dh));
            rubberband.x = rubberbandX;

            if(corner === this.resizeUI.rb || corner === this.resizeUI.lb) {
                rubberband.y = rubberbandY - hdh;
            } else {
                rubberband.y = rubberbandY + hdh;
            }

        }
        this.resizeUI.setSize(rubberband);
        // --------------------------------------------------------------------------


        // image 설정
        // --------------------------------------------------------------------------
        this.image.width = this.image.width * zoom;
        this.image.height = this.image.height * zoom;

        var posX = offsetX * zoom;
        var posY = offsetY * zoom;
        var pivotOffsetX = this.image.x - this.image.lt.x;
        var pivotOffsetY = this.image.y - this.image.lt.y;
        this.image.x = rubberband.x + posX + pivotOffsetX;
        this.image.y = rubberband.y + posY + pivotOffsetY;
        // --------------------------------------------------------------------------
    }


    expandImageStep1(corner, bounds, limit, lens, copyLens, dx, dy) {

        // offset 구하기
        // --------------------------------------------------------------------------
        var offsetX = this.image.lt.x - lens.x;
        var offsetY = this.image.lt.y - lens.y;
        // --------------------------------------------------------------------------

        var dw = (limit.width - lens.width);
        var dh = (limit.height - lens.height);

        var hdw = dw / 2;
        var hdh = dh / 2;

        var zoom, rubberband;
        var isExpandX = true;
        var isExpandY = false;

        var lessx = bounds.width - limit.width;
        var lessy = bounds.height - limit.height;

        var isLessX = true;
        var isLessY = false;

        if(Math.abs(lessx) < Math.abs(lessy)) {
            isLessX = false;
            isLessY = true;
        }

        console.log('isLessX[' + isLessX + '], isLessY[' + isLessY + ']', Calc.digit(lessx), Calc.digit(lessy));

        // x로 확대되는지 y로 확대 되는지 구분 부터
        if(dh < dw) {
            isExpandX = false;
            isExpandY = true;
            // 높이를 채우고
            //copyLens.height = bounds.height;
        } else {
            // 넓이를 채우고
            //copyLens.width = bounds.width;
        }

        // 비율 구하기
        // --------------------------------------------------------------------------
        //var zoom = Calc.getBoundsScale(limit, copyLens).min;
        var zoom = Calc.getBoundsScale(this.bounds, copyLens).min;


        // resizeUI 설정
        // --------------------------------------------------------------------------
        //var rubberband = Calc.getImageSizeKeepAspectRatio(copyLens, limit);
        var rubberband = Calc.getImageSizeKeepAspectRatio(copyLens, this.bounds);


        var rubberbandX = this.canvas.width / 2 - rubberband.width / 2;
        var rubberbandY = this.canvas.height / 2 - rubberband.height / 2;



        if(isExpandX) {
            //console.log('isExpandX', 'isLessX[' + isLessX + ']', 'isLessY[' + isLessY + ']');
            rubberband.x = rubberbandX;

            if(corner === this.resizeUI.rb || corner === this.resizeUI.lb) {
                rubberband.y = rubberbandY - hdh;
            } else {
                rubberband.y = rubberbandY + hdh;
            }

            if(isLessX) {
                if(corner == this.resizeUI.lt) {
                    console.log('!!!!!!!!! here!', rubberband.width, limit.width);
                }
            }
        } else {
            //console.log('isExpandY', 'isLessX[' + isLessX + ']', 'isLessY[' + isLessY + ']');
            rubberband.y = rubberbandY;

            if(corner === this.resizeUI.rt || corner === this.resizeUI.rb) {
                rubberband.x = rubberbandX - hdw;
            } else {
                rubberband.x = rubberbandX + hdw;
            }
        }


        this.resizeUI.setSize(rubberband);


        // --------------------------------------------------------------------------
        Painter.drawBounds(this.gLens, this.startLensBounds, true, 1, 0xFF0099, 0.6); // 핑크
        // --------------------------------------------------------------------------



        // image 설정
        // --------------------------------------------------------------------------
        this.image.width = this.image.width * zoom;
        this.image.height = this.image.height * zoom;

        var posX = offsetX * zoom;
        var posY = offsetY * zoom;
        var pivotOffsetX = this.image.x - this.image.lt.x;
        var pivotOffsetY = this.image.y - this.image.lt.y;
        this.image.x = rubberband.x + posX + pivotOffsetX;
        this.image.y = rubberband.y + posY + pivotOffsetY;
        // --------------------------------------------------------------------------
    }


    expandImage(corner, bounds, limit, lens, copyLens, dx, dy) {

        // offset 구하기
        // --------------------------------------------------------------------------
        var offsetX = this.image.lt.x - lens.x;
        var offsetY = this.image.lt.y - lens.y;
        // --------------------------------------------------------------------------

        var dw = (limit.width - lens.width);
        var dh = (limit.height - lens.height);

        var hdw = dw / 2;
        var hdh = dh / 2;

        var zoom, rubberband;
        var isExpandX = true;
        var isExpandY = false;

        var lessx = bounds.width - limit.width;
        var lessy = bounds.height - limit.height;

        var isLessX = true;
        var isLessY = false;

        if(Math.abs(lessx) < Math.abs(lessy)) {
            isLessX = false;
            isLessY = true;
        }

        //console.log('isLessX[' + isLessX + '], isLessY[' + isLessY + ']', Calc.digit(lessx), Calc.digit(lessy));

        // x로 확대되는지 y로 확대 되는지 구분 부터
        if(dh < dw) {
            isExpandX = false;
            isExpandY = true;
            // 높이를 채우고
            //copyLens.height = bounds.height;
        } else {
            // 넓이를 채우고
            //copyLens.width = bounds.width;
        }

        // 비율 구하기
        // --------------------------------------------------------------------------
        var zoom = Calc.getBoundsScale(limit, copyLens).min;
        //var zoom = Calc.getBoundsScale(this.bounds, copyLens).min;


        // resizeUI 설정
        // --------------------------------------------------------------------------
        var rubberband = Calc.getImageSizeKeepAspectRatio(copyLens, limit);
        //var rubberband = Calc.getImageSizeKeepAspectRatio(copyLens, this.bounds);


        var rubberbandX = this.canvas.width / 2 - rubberband.width / 2;
        var rubberbandY = this.canvas.height / 2 - rubberband.height / 2;



        if(isExpandX) {
            console.log('isExpandX', 'isLessX[' + isLessX + ']', 'isLessY[' + isLessY + ']');
            rubberband.x = rubberbandX;

            if(corner === this.resizeUI.rb || corner === this.resizeUI.lb) {
                rubberband.y = rubberbandY - hdh;
            } else {
                rubberband.y = rubberbandY + hdh;
            }

        } else {
            console.log('isExpandY', 'isLessX[' + isLessX + ']', 'isLessY[' + isLessY + ']');
            rubberband.y = rubberbandY;

            if(corner === this.resizeUI.rt || corner === this.resizeUI.rb) {
                rubberband.x = rubberbandX - hdw;
            } else {
                rubberband.x = rubberbandX + hdw;
            }
        }


        if(isLessX && limit.width < bounds.width) {
            this.startLensBounds.width += Math.abs(dx);
            this.startLensBounds.x = this.canvas.width / 2 - this.startLensBounds.width / 2;
        }

        if(isLessY && limit.height < bounds.height) {
            this.startLensBounds.height += Math.abs(dy);
            this.startLensBounds.y = this.canvas.height / 2 - this.startLensBounds.height / 2;
        }

        this.resizeUI.setSize(rubberband);


        // --------------------------------------------------------------------------
        Painter.drawBounds(this.gLens, this.startLensBounds, true, 1, 0xFF0099, 0.6); // 핑크
        // --------------------------------------------------------------------------



        // image 설정
        // --------------------------------------------------------------------------
        this.image.width = this.image.width * zoom;
        this.image.height = this.image.height * zoom;

        var posX = offsetX * zoom;
        var posY = offsetY * zoom;
        var pivotOffsetX = this.image.x - this.image.lt.x;
        var pivotOffsetY = this.image.y - this.image.lt.y;
        this.image.x = rubberband.x + posX + pivotOffsetX;
        this.image.y = rubberband.y + posY + pivotOffsetY;
        // --------------------------------------------------------------------------
    }


    cornerResizeChange(e) {
        var corner = e.target;
        var dx = e.dx;
        var dy = e.dy;
        var tx = corner.x + dx;
        var ty = corner.y + dy;
        var changePoint = this.resizeUI.getUpdatePoints(corner, tx, ty);

        if (this.image.isContainsBounds(changePoint)) {
            // corner.x = tx;
            // corner.y = ty;
            // this.resizeUI.updateOtherCorner(corner);

            this.resizeUI.setPoint(changePoint);

            // 코너가 이미지 안쪽으로 움직일 때 : 축소할 때
            if (tx >= this.startLensBounds.x && tx <= (this.startLensBounds.x + this.startLensBounds.width) && ty >= this.startLensBounds.y && ty <= (this.startLensBounds.y + this.startLensBounds.height)) {
                // 아무일도 일어나지 않습니다.
                //console.log('Do Nothing');
            } else {
                this.expandImage(corner, this.bounds, this.startLensBounds, this.resizeUI.bounds, this.resizeUI.bounds, dx, dy);
                this.moveUI.setSize(this.resizeUI.bounds);
            }

            this.prevLensPoints = changePoint;
        } else {
            this.resizeUI.setPoint(this.prevLensPoints);
        }

        Painter.drawBounds(this.gLens, this.startLensBounds, true, 1, 0xFF0099, 0.6); // 핑크
    }

    cornerResizeEnd(e) {
        this.moveUI.setSize(this.resizeUI.bounds);
        this.magnifyImage(this.resizeUI.bounds);
        this.gLens.clear();

        this.expandZoom = -1;
    }

    //////////////////////////////////////////////////////////////////////////
    // Getter & Setter
    //////////////////////////////////////////////////////////////////////////

    get bounds() {
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;

        var boundsWidth = canvasWidth - this.paddingX;
        var boundsHeight = canvasHeight - this.paddingY;
        var boundsX = canvasWidth / 2 - boundsWidth / 2;
        var boundsY = canvasHeight / 2 - boundsHeight / 2;

        return {
            width: boundsWidth,
            height: boundsHeight,
            x: boundsX,
            y: boundsY
        }
    }

    //////////////////////////////////////////////////////////////////////////
    // Debug Util Function
    //////////////////////////////////////////////////////////////////////////

    /**
     * 현재 화면 사이즈에 맞는 이미지 바운드 영역을 화면에 출력합니다.
     */
    displayImageRotationBounds() {
        var imageRect = Calc.getImageSizeKeepAspectRatio(this.image, this.bounds);

        var imagePoint = {
            lt: {x: 0, y: 0},
            rt: {x: imageRect.width, y: 0},
            rb: {x: imageRect.width, y: imageRect.height},
            lb: {x: 0, y: imageRect.height}
        };

        var rotationPoints = Calc.getRotationRectanglePoints({
            x: imageRect.width / 2,
            y: imageRect.height / 2
        }, imagePoint, Calc.toDegrees(this.image.rotation));
        var rotationRect = Calc.getBoundsRectangle(rotationPoints, 0);
        rotationRect.x = this.canvas.width / 2 - rotationRect.width / 2;
        rotationRect.y = this.canvas.height / 2 - rotationRect.height / 2;

        // 하늘색
        // Painter.drawBounds(this.gImage, rotationRect, true, 2, 0x00FCFF, 0.4);
    }
}