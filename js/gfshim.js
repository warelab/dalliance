/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: nil -*- */

// 
// Dalliance Genome Explorer
// (c) Thomas Down 2006-2014
//
// gfshim.js
//

"use strict";

if (typeof(require) !== 'undefined') {
    var sa = require('./sourceadapters');
    var dalliance_registerSourceAdapterFactory = sa.registerSourceAdapterFactory;
    var FeatureSourceBase = sa.FeatureSourceBase;

    var das = require('./das');
    var DASStylesheet = das.DASStylesheet;
    var DASStyle = das.DASStyle;
    var DASFeature = das.DASFeature;
    var DASGroup = das.DASGroup;

    var gf = require('genomics-fetchers');
}

function GFBBIFeatureSource(source) {
    FeatureSourceBase.call(this);
    this.source = source;

    this.bbi = gf.connectBBI(new gf.URLFetchable(this.source.uri));
}

GFBBIFeatureSource.prototype = Object.create(FeatureSourceBase.prototype);
GFBBIFeatureSource.prototype.constructor = GFBBIFeatureSource;

GFBBIFeatureSource.prototype.getStyleSheet = function(callback) {
    var thisB = this;

    this.bbi.then(function(bwg) {
        var stylesheet = new DASStylesheet();
        if (bwg.type == 'bigbed') {
            var wigStyle = new DASStyle();
            wigStyle.glyph = 'BOX';
            wigStyle.FGCOLOR = 'black';
            wigStyle.BGCOLOR = 'blue'
            wigStyle.HEIGHT = 8;
            wigStyle.BUMP = true;
            wigStyle.LABEL = true;
            wigStyle.ZINDEX = 20;
            stylesheet.pushStyle({type: 'bigwig'}, null, wigStyle);
        
            wigStyle.glyph = 'BOX';
            wigStyle.FGCOLOR = 'black';
            wigStyle.BGCOLOR = 'red'
            wigStyle.HEIGHT = 10;
            wigStyle.BUMP = true;
            wigStyle.ZINDEX = 20;
            stylesheet.pushStyle({type: 'translation'}, null, wigStyle);
                    
            var tsStyle = new DASStyle();
            tsStyle.glyph = 'BOX';
            tsStyle.FGCOLOR = 'black';
            tsStyle.BGCOLOR = 'white';
            tsStyle.HEIGHT = 10;
            tsStyle.ZINDEX = 10;
            tsStyle.BUMP = true;
            tsStyle.LABEL = true;
            stylesheet.pushStyle({type: 'transcript'}, null, tsStyle);

            var densStyle = new DASStyle();
            densStyle.glyph = 'HISTOGRAM';
            densStyle.COLOR1 = 'white';
            densStyle.COLOR2 = 'black';
            densStyle.HEIGHT=30;
            stylesheet.pushStyle({type: 'density'}, null, densStyle);
        } else {
            var wigStyle = new DASStyle();
            wigStyle.glyph = 'HISTOGRAM';
            wigStyle.COLOR1 = 'white';
            wigStyle.COLOR2 = 'black';
            wigStyle.HEIGHT=30;
            stylesheet.pushStyle({type: 'default'}, null, wigStyle);
        }

        if (bwg.definedFieldCount == 12 && bwg.fieldCount >= 14) {
            stylesheet.geneHint = true;
        }

        return callback(stylesheet);
    })
    .catch(function(err) {
        return callback(null, err);
    });
}

GFBBIFeatureSource.prototype.getScales = function() {
    return [];
}

GFBBIFeatureSource.prototype.fetch = function(chr, min, max, scale, types, pool, callback) {
    var thisB = this;
    this.bbi.then(function(bbi) {
        return bbi.getUnzoomedView().fetch(chr, min, max);
    })
    .then(function(features) {
        return callback(null, features, 1000000000);
    })
    .catch(function(err) {
        return callback(err);
    });
}

dalliance_registerSourceAdapterFactory('gf-bbi', function(source) {
    return {features: new GFBBIFeatureSource(source)};
});
