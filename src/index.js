import { isEqual, uniqueId, cloneDeep } from 'lodash';
import Draggabilly from 'draggabilly';
import cash from "cash-dom";
import ParseSVG from './ParseSVG';
import svgSaver from './saveSVGasPNG';

var snapshot = {};
var datastore = {};
var labelstore = {};
var currentData = {};
var onRecall = null;
var snapshotTimer = false;
var isTimerON = false;
var triggeredData = {};
var isAutoModeON = false;
var isIntialized = false;
var stackedSnapshot = {};
var thumbnailOptions = {};

var isMinimized = true;
var playModeON = false;
var storyTimer = false;

snapshot.initializeSnapshot = function(isAuto = false, timerDur = 5000, options = { 'class': 'snapshot', 'type': 'svg', 'size': { 'width': 100, 'height': 100 } }, onRecallCallback = () => {}) {

    isAutoModeON = isAuto;
    thumbnailOptions = {
        'class': options.class,
        'type': options.type,
        'size': { 'height': options.size.height || 100, 'width': options.size.width || 100 }
    }

    if (!isIntialized) {

        let containerWidth = (+thumbnailOptions.size.width + 65);
        // create a snapshot panel container 
        let snapshotContainer = cash('<div class="snapshot-custom-wrapper"><h5 style="font-size: 15px;text-transform: uppercase;margin: 5px 0px 0px 0px;font-weight: bold;color: #424857;">snapshot panel</h5></div>')
            .css({
                'background': 'rgba(255, 255, 255, 0.90)',
                'width': containerWidth < 300 ? 300 : containerWidth + 'px',
                'position': 'fixed',
                'top': '100px',
                'left': '15px',
                'border': '2px solid #2f2f2f',
                'border-radius': '5px',
                'z-index': '5000',
                'padding': '5px',
                'cursor': 'move',
                'max-height': '395px',
                'text-align': 'center'
            })
            .appendTo('body');

        cash('<span>&#x26F6;</span>')
            .css({
                'position': 'absolute',
                'top': '0px',
                'right': '5px',
                'color': 'black',
                'font-weight': 'bold',
                'font-size': '20px',
                'cursor': 'pointer',
            })
            .appendTo(snapshotContainer)
            .on('click', function(event) {
                if (isMinimized) {
                    cash('.snapshot-custom-wrapper')
                        .css({
                            'width': '95%',
                            'top': '10px',
                            'left': '10px'
                        })
                    isMinimized = false;
                } else {
                    let containerWidth = (+thumbnailOptions.size.width + 65);
                    cash('.snapshot-custom-wrapper')
                        .css({
                            'width': containerWidth < 300 ? 300 : containerWidth + 'px',
                        })
                    isMinimized = true;
                }
            })

        cash('<input type="checkbox" id="snapshot-mode-checkbox" ' + (isAuto ? 'checked' : '') + ' ></input>')
            .appendTo(snapshotContainer)
            .on('change', function(event) {
                if (event.currentTarget.checked) {
                    isAutoModeON = true;
                    // If a timer has not been created
                    // create it
                    snapshotTimer = snapshotTimer ? snapshotTimer :
                        new Timer(() => {
                            snapshot.storeSnapshot();
                            // stop the timer after its complete
                            if (snapshotTimer)
                                snapshotTimer.stop();
                        }, timerDur);

                    // turn timer off and stop it
                    //  then prime it to be triggered 
                    isTimerON = false;
                    snapshotTimer.stop();
                    cash('.snapshot-trigger').text('start');

                } else {
                    // turn timer off and stop it
                    //  then prime it to be triggered 
                    isTimerON = false;
                    snapshotTimer.stop();
                    snapshotTimer = false;
                    isAutoModeON = false;
                    cash('.snapshot-trigger').text('snapshot');
                }
            });


        cash('<label for="snapshot-mode-checkbox">AUTO</label>')
            .css({
                'margin-right': '10px',
                'margin-left': '5px',
                'cursor': 'pointer',
                'color': 'black'
            })
            .appendTo(snapshotContainer);

        snapshotTimer = isAuto ? new Timer(() => {
            snapshot.storeSnapshot();
            // stop the timer after its complete
            if (snapshotTimer)
                snapshotTimer.stop();
        }, timerDur) : false;

        let snapshotButton = cash('<button class="snapshot-trigger">' + (isAuto ? 'start' : 'snapshot') + '</button>')
            .css({
                'text-align': ' center',
                'vertical-align': ' middle',
                'cursor': ' pointer',
                'background-image': ' none',
                'border': ' 1px solid transparent',
                'padding': ' 6px 12px',
                'font-size': ' 14px',
                'line-height': ' 1.5',
                'border-radius': ' 4px',
                '-webkit-user-select': ' none',
                '-moz-user-select': ' none',
                '-ms-user-select': ' none',
                'user-select': ' none',
                'color': ' #1997c6',
                'background-color': ' transparent',
                'border-color': ' #1997c6',
                'margin': ' 10px auto',
                'display': 'inline-block',
                'text-transform': ' uppercase'
            })
            .appendTo('.snapshot-custom-wrapper')
            .on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                if (isAutoModeON) {
                    // timer is off at the moment so trigger it ON
                    if (!isTimerON) {
                        isTimerON = true;
                        snapshotTimer.reset();
                        cash('.snapshot-trigger').text('stop');
                    } else {
                        isTimerON = false;
                        snapshotTimer.stop();
                        cash('.snapshot-trigger').text('start');
                    }
                }
                snapshot.storeSnapshot();
            });

        let clearSnapshotButton = cash('<button class="snapshot-clear">clear</button>')
            .css({
                'text-align': ' center',
                'vertical-align': ' middle',
                'cursor': ' pointer',
                'background-image': ' none',
                'border': ' 1px solid transparent',
                'padding': ' 6px 12px',
                'font-size': ' 14px',
                'line-height': ' 1.5',
                'border-radius': ' 4px',
                '-webkit-user-select': ' none',
                '-moz-user-select': ' none',
                '-ms-user-select': ' none',
                'user-select': ' none',
                'color': ' #1997c6',
                'background-color': ' transparent',
                'border-color': ' #1997c6',
                'margin': ' 10px auto',
                'display': 'inline-block',
                'text-transform': ' uppercase',
                'margin-left': '5px'
            })
            .appendTo('.snapshot-custom-wrapper')
            .on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                Object.keys(datastore)
                    .map(function(d) {
                        delete datastore[d];
                        cash('#' + d).remove();
                    });
                currentData = {};
                triggeredData = {};
            });

        let playPlauseButton = cash('<button class="story-mode">&#x25B6;</button>')
            .css({
                'text-align': ' center',
                'vertical-align': ' middle',
                'cursor': ' pointer',
                'background-image': ' none',
                'border': ' 1px solid transparent',
                'padding': ' 6px 12px',
                'font-size': ' 14px',
                'line-height': ' 1.5',
                'border-radius': ' 4px',
                '-webkit-user-select': ' none',
                '-moz-user-select': ' none',
                '-ms-user-select': ' none',
                'user-select': ' none',
                'color': ' #1997c6',
                'background-color': ' transparent',
                'border-color': ' #1997c6',
                'margin': ' 10px auto',
                'display': 'inline-block',
                'text-transform': ' uppercase',
                'margin-left': '5px'
            })
            .appendTo('.snapshot-custom-wrapper')
            .on('click', function(event) {

                if (playModeON) {
                    playModeON = false;
                    cash('.story-mode').html('&#x25B6;');
                    storyTimer.stop();
                    storyTimer = null;
                } else {
                    playModeON = true;
                    cash('.story-mode').html('&#x23F8;');

                    let storyPoints = Object.keys(datastore);

                    //  Also show names at this point
                    storyTimer = new Timer(() => {
                        let storyPoint = storyPoints.shift();
                        if (storyPoint) {
                            const data = datastore[storyPoint];
                            // store seperately so self triggerring doesnt occur
                            triggeredData = cloneDeep(data);
                            if (data) { onRecall(data) }
                        } else {
                            playModeON = false;
                            cash('.story-mode').html('&#x25B6;');
                            storyTimer.stop();
                            storyTimer = null;
                        }
                    }, 1000);
                }
            });


        cash("<div class='snapshot-image-wrapper'></div>")
            .css({
                'max-height': '300px',
                'overflow-y': 'scroll',
                'text-align': 'center'
            })
            .appendTo('.snapshot-custom-wrapper');
        new Draggabilly('.snapshot-custom-wrapper', {});
    }
    onRecall = onRecallCallback;
    isIntialized = true;
}


function createThumbnail(thumbnailData, uri) {

    const snapshotID = 'snapshot-code-' + uniqueId();

    // store snapshotData
    datastore[snapshotID] = thumbnailData;
    labelstore[snapshotID] = Object.keys(datastore).length;
    let imageButton = cash('<div class="snapshot-entry" id=' + snapshotID + '></div>')
        .css({
            'border': ' 1px solid transparent',
            'border-radius': ' 4px',
            'border-color': ' #1997c6',
            'display': 'inline-block',
            'position': 'relative',
            'overflow': 'hidden',
            'margin': '5px 5px 5px 0px',
            'cursor': 'pointer'
        })
        .appendTo('.snapshot-image-wrapper')
        .on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            const targetName = event.target.className,
                uniqueCode = event.currentTarget.id;

            if (targetName.indexOf('snapshot-recall') > -1) {
                const data = datastore[uniqueCode];
                // store seperately so self triggerring doesnt occur
                triggeredData = cloneDeep(data);
                if (data) { onRecall(data) }
            } else if (targetName.indexOf('snapshot-edit') > -1) {

                // trigger an option to ed``it the snapshot tag.
                var newLabel = prompt("Please enter a new label for the selected snapshot", '');
                labelstore[uniqueCode] = newLabel;
                cash('#' + uniqueCode + ' > .snapshot-label').text(newLabel);

            } else {
                delete datastore[uniqueCode];
                delete labelstore[uniqueCode];
                cash('#' + uniqueCode).remove();
            }

        });

    cash('<div class="snapshot-delete"><span>×</span></div>')
        .css({
            'background': ' white',
            'border-radius': ' 10px',
            'width': ' 20px',
            'position': ' absolute',
            'right': ' 2px',
            'top': ' 2px',
            'color': ' black',
            'opacity': ' 1',
            'float': ' right',
            'font-size': ' 21px',
            'font-weight': ' bold',
            'line-height': ' 1'
        })
        .appendTo(imageButton);

    cash('<div class="snapshot-edit">&#128393;</div>')
        .css({
            'background': ' white',
            'border-radius': ' 10px',
            'width': ' 20px',
            'position': ' absolute',
            'right': ' 2px',
            'top': ' 27.5px',
            'color': ' black',
            'opacity': ' 1',
            'float': ' right',
            'font-size': ' 21px',
            'font-weight': ' bold',
            'line-height': ' 1'
        })
        .appendTo(imageButton);

    cash('<div class="snapshot-label">' + labelstore[snapshotID] + '</div>')
        .css({
            'background': ' white',
            'border-radius': ' 3px',
            'min-width': ' 17px',
            'position': ' absolute',
            'left': ' 2px',
            'bottom': ' 2px',
            'color': ' black',
            'opacity': ' 1',
            'float': ' right',
            'font-size': ' 15px',
            'padding': '2px',
            'font-weight': ' bold',
            'line-height': ' 1'
        })
        .appendTo(imageButton);

    imageButton.prepend('<img class="snapshot-recall" height=' + thumbnailOptions.size.height + ' width=' + thumbnailOptions.size.width + ' id=' + snapshotID + ' src=' + uri + ' />')
}

snapshot.updateSnapshot = function(data) {
    // store a cloned copy of the data
    currentData = cloneDeep(data);
    // if timer is ON reset it to be triggered with the new data
    if (isTimerON)
        snapshotTimer.reset();
}

snapshot.storeSnapshot = function() {
    let isNewSnapshotAvailable = !playModeON && !!currentData && !isEqual(stackedSnapshot, currentData) && !isEqual(triggeredData, currentData);
    // store current data in snapshot
    let snapshotData = currentData;
    // clear currentData
    currentData = false;
    // clear trigger 
    triggeredData = false;
    // Get the Thumbnail element
    let thumbnailElements = cash(thumbnailOptions.class);
    // check if there is a visual snapshot is available to be stored
    if (isNewSnapshotAvailable && thumbnailElements.length > 0) {
        if (thumbnailOptions.type == 'canvas') {
            createThumbnail(snapshotData, thumbnailElements[0].toDataURL('image/png', 0.75));
        } else {
            ParseSVG(thumbnailElements[0])
                .then((svgEl) => {
                    svgSaver
                        .svgAsPngUri(svgEl, { 'scale': '0.5' })
                        .then((uri) => createThumbnail(snapshotData, uri));
                });
        }
    }
}

//  code sourced from stackoverflow - https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);
    this.stop = function() {
            if (timerObj) {
                clearInterval(timerObj);
                timerObj = null;
            }
            return this;
        }
        // start timer using current settings (if it's not already running)
    this.start = function() {
            if (!timerObj) {
                this.stop();
                timerObj = setInterval(fn, t);
            }
            return this;
        }
        // start with new interval, stop current interval
    this.reset = function() { return this.stop().start() };
}
window.snapshot = snapshot;
module.exports = snapshot;