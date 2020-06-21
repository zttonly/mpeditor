import showdown from 'showdown';
showdown.subParser('images', function (text, options, globals) {
    'use strict';

    text = globals.converter._dispatch('images.before', text, options, globals);
    // eslint-disable-next-line max-len
    let inlineRegExp = /!\[(.*?)]\s?\([ \t]*()<?(\S+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(['"])(.*?)\6[ \t]*)?\)/g;
    let referenceRegExp = /!\[([^\]]*?)] ?(?:\n *)?\[(.*?)]()()()()()/g;

    function writeImageTag(wholeMatch, altText, linkId, url, width, height, m5, title) {
        let gUrls = globals.gUrls;
        let gTitles = globals.gTitles;
        let gDims = globals.gDimensions;

        linkId = linkId.toLowerCase();

        if (!title) {
            title = '';
        }

        if (url === '' || url === null) {
            if (linkId === '' || linkId === null) {
                // lower-case and turn embedded newlines into spaces
                linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
            }
            url = '#' + linkId;

            if (!showdown.helper.isUndefined(gUrls[linkId])) {
                url = gUrls[linkId];
                if (!showdown.helper.isUndefined(gTitles[linkId])) {
                    title = gTitles[linkId];
                }
                if (!showdown.helper.isUndefined(gDims[linkId])) {
                    width = gDims[linkId].width;
                    height = gDims[linkId].height;
                }
            }
            else {
                return wholeMatch;
            }
        }

        altText = altText
            .replace(/"/g, '&quot;')
            // altText = showdown.helper.escapeCharacters(altText, '*_', false);
            .replace(showdown.helper.regexes.asteriskAndDash, showdown.helper.escapeCharactersCallback);
        // url = showdown.helper.escapeCharacters(url, '*_', false);
        url = url.replace(showdown.helper.regexes.asteriskAndDash, showdown.helper.escapeCharactersCallback);
        let result = '<img src="' + url + '" alt="' + altText + '"';

        if (title) {
            title = title
                .replace(/"/g, '&quot;')
                // title = showdown.helper.escapeCharacters(title, '*_', false);
                .replace(showdown.helper.regexes.asteriskAndDash, showdown.helper.escapeCharactersCallback);
            result += ' title="' + title + '"';
        }

        if (width && height) {
            width = width === '*' ? 'auto' : width;
            height = height === '*' ? 'auto' : height;
            result += ' width="' + width + '"';
            result += ' height="' + height + '"';

            width = getUnit(width);
            height = getUnit(height);
            result += ' style="width:' + width + ';';
            result += ' height:' + height + '"';
        }

        result += ' />';
        return result;
    }

    function getUnit(text) {
        let t = text.slice(-1);
        if (/\d/.test(t)) {
            return text + 'px';
        }
        return text;
    }
    // First, handle reference-style labeled images: ![alt text][id]
    text = text.replace(referenceRegExp, writeImageTag);

    // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")
    text = text.replace(inlineRegExp, writeImageTag);

    text = globals.converter._dispatch('images.after', text, options, globals);
    return text;
});
