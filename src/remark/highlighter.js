/* Automatically generated */

var hljs = (function() {
      var exports = {};
      /*
Syntax highlighting with language autodetection.
https://highlightjs.org/
*/

(function(factory) {

  // Setup highlight.js for different environments. First is Node.js or
  // CommonJS.
  if(typeof exports !== 'undefined') {
    factory(exports);
  } else if (typeof window !== 'undefined') {
    // Export hljs globally even when using AMD for cases when this script
    // is loaded with others that may still expect a global hljs.
    window.hljs = factory({});

    // Finally register the global hljs with AMD.
    if(typeof define === 'function' && define.amd) {
      define('hljs', [], function() {
        return window.hljs;
      });
    }
  } else if (typeof self !== 'undefined') {
    // Export hljs to web worker.
    self.hljs = factory({});
  } else {
    throw new Error('No global object found to bind hljs variable to.');
  }

}(function(hljs) {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index == 0;
  }

  function isNotHighlighted(language) {
    return (/^(no-?highlight|plain|text)$/i).test(language);
  }

  function blockLanguage(block) {
    var i, match, length,
        classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names
    match = (/\blang(?:uage)?-([\w-]+)\b/i).exec(classes);
    if (match) {
      return getLanguage(match[1]) ? match[1] : 'no-highlight';
    }

    classes = classes.split(/\s+/);
    for (i = 0, length = classes.length; i < length; i++) {
      if (getLanguage(classes[i]) || isNotHighlighted(classes[i])) {
        return classes[i];
      }
    }
  }

  function inherit(parent, obj) {
    var result = {}, key;
    for (key in parent)
      result[key] = parent[key];
    if (obj)
      for (key in obj)
        result[key] = obj[key];
    return result;
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: 'stop',
              offset: offset,
              node: child
            });
          }
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return new RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        var flatten = function(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        };

        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          Object.keys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\b\w+\b/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c == 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
        })
        .concat([mode.terminator_end, mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(/*s*/) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        while (mode.endsParent && mode.parent) {
          mode = mode.parent;
        }
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : '</span>';

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      if (!top.keywords)
        return escape(mode_buffer);
      var result = '';
      var last_index = 0;
      top.lexemesRe.lastIndex = 0;
      var match = top.lexemesRe.exec(mode_buffer);
      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      var explicit = typeof top.subLanguage == 'string';
      if (explicit && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }

      var result = explicit ?
                   highlight(top.subLanguage, mode_buffer, true, continuations[top.subLanguage]) :
                   highlightAuto(mode_buffer, top.subLanguage.length ? top.subLanguage : undefined);

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (explicit) {
        continuations[top.subLanguage] = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexeme) {
      var markup = mode.className? buildSpan(mode.className, '', true): '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexeme) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexeme;
      }
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;
      if (lexeme === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (!(origin.returnEnd || origin.excludeEnd)) {
          mode_buffer += lexeme;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          relevance += top.relevance;
          top = top.parent;
        } while (top != end_mode.parent);
        if (origin.excludeEnd) {
          result += escape(lexeme);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var continuations = {}; // keep continuations for sub-languages
    var result = '', current;
    for(current = top; current != language; current = current.parent) {
      if (current.className) {
        result = buildSpan(current.className, '', true) + result;
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += '</span>';
        }
      }
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message.indexOf('Illegal') != -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.forEach(function(name) {
      if (!getLanguage(name)) {
        return;
      }
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    if (options.tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1 /*..., offset, s*/) {
        return p1.replace(/\t/g, options.tabReplace);
      });
    }
    if (options.useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  function buildClassName(prevClassName, currentLang, resultLang) {
    var language = currentLang ? aliases[currentLang] : resultLang,
        result   = [prevClassName.trim()];

    if (!prevClassName.match(/\bhljs\b/)) {
      result.push('hljs');
    }

    if (prevClassName.indexOf(language) === -1) {
      result.push(language);
    }

    return result.join(' ').trim();
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var language = blockLanguage(block);
    if (isNotHighlighted(language))
        return;

    var node;
    if (options.useBR) {
      node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      node.innerHTML = block.innerHTML.replace(/\n/g, '').replace(/<br[ \/]*>/g, '\n');
    } else {
      node = block;
    }
    var text = node.textContent;
    var result = language ? highlight(language, text, true) : highlightAuto(text);

    var originalStream = nodeStream(node);
    if (originalStream.length) {
      var resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      resultNode.innerHTML = result.value;
      result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className = buildClassName(block.className, language, result.language);
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  /*
  Updates highlight.js global options with values passed in the form of an object
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    Array.prototype.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  var languages = {};
  var aliases = {};

  function registerLanguage(name, language) {
    var lang = languages[name] = language(hljs);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function listLanguages() {
    return Object.keys(languages);
  }

  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  hljs.highlight = highlight;
  hljs.highlightAuto = highlightAuto;
  hljs.fixMarkup = fixMarkup;
  hljs.highlightBlock = highlightBlock;
  hljs.configure = configure;
  hljs.initHighlighting = initHighlighting;
  hljs.initHighlightingOnLoad = initHighlightingOnLoad;
  hljs.registerLanguage = registerLanguage;
  hljs.listLanguages = listLanguages;
  hljs.getLanguage = getLanguage;
  hljs.inherit = inherit;

  // Common regexps
  hljs.IDENT_RE = '[a-zA-Z]\\w*';
  hljs.UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
  hljs.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  hljs.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  hljs.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  hljs.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  hljs.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  hljs.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/
  };
  hljs.COMMENT = function (begin, end, inherits) {
    var mode = hljs.inherit(
      {
        className: 'comment',
        begin: begin, end: end,
        contains: []
      },
      inherits || {}
    );
    mode.contains.push(hljs.PHRASAL_WORDS_MODE);
    mode.contains.push({
      className: 'doctag',
      begin: "(?:TODO|FIXME|NOTE|BUG|XXX):",
      relevance: 0
    });
    return mode;
  };
  hljs.C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$');
  hljs.C_BLOCK_COMMENT_MODE = hljs.COMMENT('/\\*', '\\*/');
  hljs.HASH_COMMENT_MODE = hljs.COMMENT('#', '$');
  hljs.NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE,
    relevance: 0
  };
  hljs.C_NUMBER_MODE = {
    className: 'number',
    begin: hljs.C_NUMBER_RE,
    relevance: 0
  };
  hljs.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: hljs.BINARY_NUMBER_RE,
    relevance: 0
  };
  hljs.CSS_NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE + '(' +
      '%|em|ex|ch|rem'  +
      '|vw|vh|vmin|vmax' +
      '|cm|mm|in|pt|pc|px' +
      '|deg|grad|rad|turn' +
      '|s|ms' +
      '|Hz|kHz' +
      '|dpi|dpcm|dppx' +
      ')?',
    relevance: 0
  };
  hljs.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gimuy]*/,
    illegal: /\n/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  hljs.TITLE_MODE = {
    className: 'title',
    begin: hljs.IDENT_RE,
    relevance: 0
  };
  hljs.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };

  return hljs;
}));
;
      return exports;
    }())
  , languages = [{name:"javascript",create:/*
Language: JavaScript
Category: common, scripting
*/

function(hljs) {
  return {
    aliases: ['js'],
    keywords: {
      keyword:
        'in of if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const export super debugger as async await ' +
        // ECMAScript 6 modules import
        'import from as'
      ,
      literal:
        'true false null undefined NaN Infinity',
      built_in:
        'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
        'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
        'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
        'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
        'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
        'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
        'module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect ' +
        'Promise'
    },
    contains: [
      {
        className: 'meta',
        relevance: 10,
        begin: /^\s*['"]use (strict|asm)['"]/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      { // template string
        className: 'string',
        begin: '`', end: '`',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          {
            className: 'subst',
            begin: '\\$\\{', end: '\\}'
          }
        ]
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'number',
        variants: [
          { begin: '\\b(0[bB][01]+)' },
          { begin: '\\b(0[oO][0-7]+)' },
          { begin: hljs.C_NUMBER_RE }
        ],
        relevance: 0
      },
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.REGEXP_MODE,
          { // E4X / JSX
            begin: /</, end: />\s*[);\]]/,
            relevance: 0,
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          }
        ],
        illegal: /\[|%/
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      },
      {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      },
      { // ES6 class
        className: 'class',
        beginKeywords: 'class', end: /[{;=]/, excludeEnd: true,
        illegal: /[:"\[\]]/,
        contains: [
          {beginKeywords: 'extends'},
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        beginKeywords: 'constructor', end: /\{/, excludeEnd: true
      }
    ],
    illegal: /#/
  };
}
},{name:"ruby",create:/*
Language: Ruby
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
Category: common
*/

function(hljs) {
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS =
    'and false then defined module in return redo if BEGIN retry end for true self when ' +
    'next until do begin unless END rescue nil else break undef not super class case ' +
    'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor';
  var YARDOCTAG = {
    className: 'doctag',
    begin: '@[A-Za-z]+'
  };
  var IRB_OBJECT = {
    begin: '#<', end: '>'
  };
  var COMMENT_MODES = [
    hljs.COMMENT(
      '#',
      '$',
      {
        contains: [YARDOCTAG]
      }
    ),
    hljs.COMMENT(
      '^\\=begin',
      '^\\=end',
      {
        contains: [YARDOCTAG],
        relevance: 10
      }
    ),
    hljs.COMMENT('^__END__', '\\n$')
  ];
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: RUBY_KEYWORDS
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, SUBST],
    variants: [
      {begin: /'/, end: /'/},
      {begin: /"/, end: /"/},
      {begin: /`/, end: /`/},
      {begin: '%[qQwWx]?\\(', end: '\\)'},
      {begin: '%[qQwWx]?\\[', end: '\\]'},
      {begin: '%[qQwWx]?{', end: '}'},
      {begin: '%[qQwWx]?<', end: '>'},
      {begin: '%[qQwWx]?/', end: '/'},
      {begin: '%[qQwWx]?%', end: '%'},
      {begin: '%[qQwWx]?-', end: '-'},
      {begin: '%[qQwWx]?\\|', end: '\\|'},
      {
        // \B in the beginning suppresses recognition of ?-sequences where ?
        // is the last character of a preceding identifier, as in: `func?4`
        begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
      }
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)', endsParent: true,
    keywords: RUBY_KEYWORDS
  };

  var RUBY_DEFAULT_CONTAINS = [
    STRING,
    IRB_OBJECT,
    {
      className: 'class',
      beginKeywords: 'class module', end: '$|;',
      illegal: /=/,
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?'}),
        {
          begin: '<\\s*',
          contains: [{
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
          }]
        }
      ].concat(COMMENT_MODES)
    },
    {
      className: 'function',
      beginKeywords: 'def', end: '$|;',
      contains: [
        hljs.inherit(hljs.TITLE_MODE, {begin: RUBY_METHOD_RE}),
        PARAMS
      ].concat(COMMENT_MODES)
    },
    {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(\\!|\\?)?:',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':',
      contains: [STRING, {begin: RUBY_METHOD_RE}],
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    {
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))' // variables
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: [
        IRB_OBJECT,
        {
          className: 'regexp',
          contains: [hljs.BACKSLASH_ESCAPE, SUBST],
          illegal: /\n/,
          variants: [
            {begin: '/', end: '/[a-z]*'},
            {begin: '%r{', end: '}[a-z]*'},
            {begin: '%r\\(', end: '\\)[a-z]*'},
            {begin: '%r!', end: '![a-z]*'},
            {begin: '%r\\[', end: '\\][a-z]*'}
          ]
        }
      ].concat(COMMENT_MODES),
      relevance: 0
    }
  ].concat(COMMENT_MODES);

  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  PARAMS.contains = RUBY_DEFAULT_CONTAINS;

  var SIMPLE_PROMPT = "[>?]>";
  var DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+>";
  var RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>";

  var IRB_DEFAULT = [
    {
      begin: /^\s*=>/,
      starts: {
        end: '$', contains: RUBY_DEFAULT_CONTAINS
      }
    },
    {
      className: 'meta',
      begin: '^('+SIMPLE_PROMPT+"|"+DEFAULT_PROMPT+'|'+RVM_PROMPT+')',
      starts: {
        end: '$', contains: RUBY_DEFAULT_CONTAINS
      }
    }
  ];

  return {
    aliases: ['rb', 'gemspec', 'podspec', 'thor', 'irb'],
    keywords: RUBY_KEYWORDS,
    illegal: /\/\*/,
    contains: COMMENT_MODES.concat(IRB_DEFAULT).concat(RUBY_DEFAULT_CONTAINS)
  };
}
},{name:"python",create:/*
Language: Python
Category: common
*/

function(hljs) {
  var PROMPT = {
    className: 'meta',  begin: /^(>>>|\.\.\.) /
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /(u|b)?r?'''/, end: /'''/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|b)?r?"""/, end: /"""/,
        contains: [PROMPT],
        relevance: 10
      },
      {
        begin: /(u|r|ur)'/, end: /'/,
        relevance: 10
      },
      {
        begin: /(u|r|ur)"/, end: /"/,
        relevance: 10
      },
      {
        begin: /(b|br)'/, end: /'/
      },
      {
        begin: /(b|br)"/, end: /"/
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  var NUMBER = {
    className: 'number', relevance: 0,
    variants: [
      {begin: hljs.BINARY_NUMBER_RE + '[lLjJ]?'},
      {begin: '\\b(0o[0-7]+)[lLjJ]?'},
      {begin: hljs.C_NUMBER_RE + '[lLjJ]?'}
    ]
  };
  var PARAMS = {
    className: 'params',
    begin: /\(/, end: /\)/,
    contains: ['self', PROMPT, NUMBER, STRING]
  };
  return {
    aliases: ['py', 'gyp'],
    keywords: {
      keyword:
        'and elif is global as in if from raise for except finally print import pass return ' +
        'exec else break not with class assert yield try while continue del or def lambda ' +
        'async await nonlocal|10 None True False',
      built_in:
        'Ellipsis NotImplemented'
    },
    illegal: /(<\/|->|\?)/,
    contains: [
      PROMPT,
      NUMBER,
      STRING,
      hljs.HASH_COMMENT_MODE,
      {
        variants: [
          {className: 'function', beginKeywords: 'def', relevance: 10},
          {className: 'class', beginKeywords: 'class'}
        ],
        end: /:/,
        illegal: /[${=;\n,]/,
        contains: [hljs.UNDERSCORE_TITLE_MODE, PARAMS]
      },
      {
        className: 'meta',
        begin: /^[\t ]*@/, end: /$/
      },
      {
        begin: /\b(print|exec)\(/ // don’t highlight keywords-turned-functions in Python 3
      }
    ]
  };
}
},{name:"bash",create:/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
Category: common
*/

function(hljs) {
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$[\w\d#@][\w\d_]*/},
      {begin: /\$\{(.*?)}/}
    ]
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: /"/, end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      {
        className: 'variable',
        begin: /\$\(/, end: /\)/,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };

  return {
    aliases: ['sh', 'zsh'],
    lexemes: /-?[a-z\.]+/,
    keywords: {
      keyword:
        'if then else elif fi for while in do done case esac function',
      literal:
        'true false',
      built_in:
        // Shell built-ins
        // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
        'break cd continue eval exec exit export getopts hash pwd readonly return shift test times ' +
        'trap umask unset ' +
        // Bash built-ins
        'alias bind builtin caller command declare echo enable help let local logout mapfile printf ' +
        'read readarray source type typeset ulimit unalias ' +
        // Shell modifiers
        'set shopt ' +
        // Zsh built-ins
        'autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles ' +
        'compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate ' +
        'fc fg float functions getcap getln history integer jobs kill limit log noglob popd print ' +
        'pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit ' +
        'unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof ' +
        'zpty zregexparse zsocket zstyle ztcp',
      _:
        '-ne -eq -lt -gt -f -d -e -s -l -a' // relevance booster
    },
    contains: [
      {
        className: 'meta',
        begin: /^#![^\n]+sh\s*$/,
        relevance: 10
      },
      {
        className: 'function',
        begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
        returnBegin: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
        relevance: 0
      },
      hljs.HASH_COMMENT_MODE,
      hljs.NUMBER_MODE,
      QUOTE_STRING,
      APOS_STRING,
      VAR
    ]
  };
}
},{name:"java",create:/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
Category: common, enterprise
*/

function(hljs) {
  var GENERIC_IDENT_RE = hljs.UNDERSCORE_IDENT_RE + '(<' + hljs.UNDERSCORE_IDENT_RE + '>)?';
  var KEYWORDS =
    'false synchronized int abstract float private char boolean static null if const ' +
    'for true while long strictfp finally protected import native final void ' +
    'enum else break transient catch instanceof byte super volatile case assert short ' +
    'package default double public try this switch continue throws protected public private';

  // https://docs.oracle.com/javase/7/docs/technotes/guides/language/underscores-literals.html
  var JAVA_NUMBER_RE = '\\b' +
    '(' +
      '0[bB]([01]+[01_]+[01]+|[01]+)' + // 0b...
      '|' +
      '0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)' + // 0x...
      '|' +
      '(' +
        '([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?' +
        '|' +
        '\\.([\\d]+[\\d_]+[\\d]+|[\\d]+)' +
      ')' +
      '([eE][-+]?\\d+)?' + // octal, decimal, float
    ')' +
    '[lLfF]?';
  var JAVA_NUMBER_MODE = {
    className: 'number',
    begin: JAVA_NUMBER_RE,
    relevance: 0
  };

  return {
    aliases: ['jsp'],
    keywords: KEYWORDS,
    illegal: /<\/|#/,
    contains: [
      hljs.COMMENT(
        '/\\*\\*',
        '\\*/',
        {
          relevance : 0,
          contains : [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/, relevance: 0
            },
            {
              className : 'doctag',
              begin : '@[A-Za-z]+'
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'class',
        beginKeywords: 'class interface', end: /[{;=]/, excludeEnd: true,
        keywords: 'class interface',
        illegal: /[:"\[\]]/,
        contains: [
          {beginKeywords: 'extends implements'},
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new throw return else',
        relevance: 0
      },
      {
        className: 'function',
        begin: '(' + GENERIC_IDENT_RE + '\\s+)+' + hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          {
            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true,
            relevance: 0,
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              hljs.C_NUMBER_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      JAVA_NUMBER_MODE,
      {
        className: 'meta', begin: '@[A-Za-z]+'
      }
    ]
  };
}
},{name:"php",create:/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
Category: common
*/

function(hljs) {
  var VARIABLE = {
    begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var PREPROCESSOR = {
    className: 'meta', begin: /<\?(php)?|\?>/
  };
  var STRING = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
    variants: [
      {
        begin: 'b"', end: '"'
      },
      {
        begin: 'b\'', end: '\''
      },
      hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
      hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null})
    ]
  };
  var NUMBER = {variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]};
  return {
    aliases: ['php3', 'php4', 'php5', 'php6'],
    case_insensitive: true,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception default die require __FUNCTION__ ' +
      'enddeclare final try switch continue endfor endif declare unset true false ' +
      'trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' +
      'yield finally',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      hljs.COMMENT(
        '/\\*',
        '\\*/',
        {
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+'
            },
            PREPROCESSOR
          ]
        }
      ),
      hljs.COMMENT(
        '__halt_compiler.+?;',
        false,
        {
          endsWithParent: true,
          keywords: '__halt_compiler',
          lexemes: hljs.UNDERSCORE_IDENT_RE
        }
      ),
      {
        className: 'string',
        begin: /<<<['"]?\w+['"]?$/, end: /^\w+;?$/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          {
            className: 'subst',
            variants: [
              {begin: /\$\w+/},
              {begin: /\{\$/, end: /\}/}
            ]
          }
        ]
      },
      PREPROCESSOR,
      VARIABLE,
      {
        // swallow composed identifiers to avoid parsing them as keywords
        begin: /(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /[;{]/, excludeEnd: true,
        illegal: '\\$|\\[|%',
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRING,
              NUMBER
            ]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class interface', end: '{', excludeEnd: true,
        illegal: /[:\(\$"]/,
        contains: [
          {beginKeywords: 'extends implements'},
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        beginKeywords: 'namespace', end: ';',
        illegal: /[\.']/,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        beginKeywords: 'use', end: ';',
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      },
      STRING,
      NUMBER
    ]
  };
}
},{name:"perl",create:/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
Category: common
*/

function(hljs) {
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
  var SUBST = {
    className: 'subst',
    begin: '[$@]\\{', end: '\\}',
    keywords: PERL_KEYWORDS
  };
  var METHOD = {
    begin: '->{', end: '}'
    // contains defined later
  };
  var VAR = {
    variants: [
      {begin: /\$\d/},
      {begin: /[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},
      {begin: /[\$%@][^\s\w{]/, relevance: 0}
    ]
  };
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR];
  var PERL_DEFAULT_CONTAINS = [
    VAR,
    hljs.HASH_COMMENT_MODE,
    hljs.COMMENT(
      '^\\=\\w',
      '\\=cut',
      {
        endsWithParent: true
      }
    ),
    METHOD,
    {
      className: 'string',
      contains: STRING_CONTAINS,
      variants: [
        {
          begin: 'q[qwxr]?\\s*\\(', end: '\\)',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\[', end: '\\]',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\{', end: '\\}',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\|', end: '\\|',
          relevance: 5
        },
        {
          begin: 'q[qwxr]?\\s*\\<', end: '\\>',
          relevance: 5
        },
        {
          begin: 'qw\\s+q', end: 'q',
          relevance: 5
        },
        {
          begin: '\'', end: '\'',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '"', end: '"'
        },
        {
          begin: '`', end: '`',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: '{\\w+}',
          contains: [],
          relevance: 0
        },
        {
          begin: '\-?\\w+\\s*\\=\\>',
          contains: [],
          relevance: 0
        }
      ]
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    { // regexp container
      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        {
          className: 'regexp',
          begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          relevance: 10
        },
        {
          className: 'regexp',
          begin: '(m|qr)?/', end: '/[a-z]*',
          contains: [hljs.BACKSLASH_ESCAPE],
          relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      className: 'function',
      beginKeywords: 'sub', end: '(\\s*\\(.*?\\))?[;{]', excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE]
    },
    {
      begin: '-\\w\\b',
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: 'mojolicious',
      contains: [
        {
            begin: "^@@.*",
            end: "$",
            className: "comment"
        }
      ]
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains = PERL_DEFAULT_CONTAINS;

  return {
    aliases: ['pl'],
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}
},{name:"cpp",create:/*
Language: C++
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Zaven Muradyan <megalivoithos@gmail.com>, Roel Deckers <admin@codingcat.nl>
Category: common, system
*/

function(hljs) {
  var CPP_PRIMATIVE_TYPES = {
    className: 'keyword',
    begin: '\\b[a-z\\d_]*_t\\b'
  };

  var STRINGS = {
    className: 'string',
    variants: [
      hljs.inherit(hljs.QUOTE_STRING_MODE, { begin: '((u8?|U)|L)?"' }),
      {
        begin: '(u8?|U)?R"', end: '"',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      }
    ]
  };

  var NUMBERS = {
    className: 'number',
    variants: [
      { begin: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)' },
      { begin: hljs.C_NUMBER_RE }
    ],
    relevance: 0
  };

  var PREPROCESSOR =       {
    className: 'meta',
    begin: '#', end: '$',
    keywords: 'if else elif endif define undef warning error line ' +
              'pragma ifdef ifndef',
    contains: [
      {
        begin: /\\\n/, relevance: 0
      },
      {
        beginKeywords: 'include', end: '$',
        contains: [
          STRINGS,
          {
            className: 'string',
            begin: '<', end: '>',
            illegal: '\\n',
          }
        ]
      },
      STRINGS,
      NUMBERS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  var FUNCTION_TITLE = hljs.IDENT_RE + '\\s*\\(';

  var CPP_KEYWORDS = {
    keyword: 'int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long volatile static protected bool template mutable if public friend ' +
      'do goto auto void enum else break extern using class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue inline delete alignof constexpr decltype ' +
      'noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary ' +
      'atomic_bool atomic_char atomic_schar ' +
      'atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong ' +
      'atomic_ullong',
    built_in: 'std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos ' +
      'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' +
      'fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' +
      'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow ' +
      'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' +
      'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' +
      'vfprintf vprintf vsprintf',
    literal: 'true false nullptr NULL'
  };

  return {
    aliases: ['c', 'cc', 'h', 'c++', 'h++', 'hpp'],
    keywords: CPP_KEYWORDS,
    illegal: '</',
    contains: [
      CPP_PRIMATIVE_TYPES,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      NUMBERS,
      STRINGS,
      PREPROCESSOR,
      {
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        contains: ['self', CPP_PRIMATIVE_TYPES]
      },
      {
        begin: hljs.IDENT_RE + '::',
        keywords: CPP_KEYWORDS
      },
      {
        // Expression keywords prevent 'keyword Name(...) or else if(...)' from
        // being recognized as a function definition
        beginKeywords: 'new throw return else',
        relevance: 0
      },
      {
        className: 'function',
        begin: '(' + hljs.IDENT_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
        returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: CPP_KEYWORDS,
        illegal: /[^\w\s\*&]/,
        contains: [
          {
            begin: FUNCTION_TITLE, returnBegin: true,
            contains: [hljs.TITLE_MODE],
            relevance: 0
          },
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              STRINGS,
              NUMBERS
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          PREPROCESSOR
        ]
      }
    ]
  };
}
},{name:"objectivec",create:/*
Language: Objective C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>, Matt Diephouse <matt@diephouse.com>, Andrew Farmer <ahfarmer@gmail.com>
Category: common
*/

function(hljs) {
  var API_CLASS = {
    className: 'built_in',
    begin: '(AV|CA|CF|CG|CI|MK|MP|NS|UI)\\w+',
  };
  var OBJC_KEYWORDS = {
    keyword:
      'int float while char export sizeof typedef const struct for union ' +
      'unsigned long volatile static bool mutable if do return goto void ' +
      'enum else break extern asm case short default double register explicit ' +
      'signed typename this switch continue wchar_t inline readonly assign ' +
      'readwrite self @synchronized id typeof ' +
      'nonatomic super unichar IBOutlet IBAction strong weak copy ' +
      'in out inout bycopy byref oneway __strong __weak __block __autoreleasing ' +
      '@private @protected @public @try @property @end @throw @catch @finally ' +
      '@autoreleasepool @synthesize @dynamic @selector @optional @required',
    literal:
      'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  var LEXEMES = /[a-zA-Z@][a-zA-Z0-9_]*/;
  var CLASS_KEYWORDS = '@interface @class @protocol @implementation';
  return {
    aliases: ['mm', 'objc', 'obj-c'],
    keywords: OBJC_KEYWORDS,
    lexemes: LEXEMES,
    illegal: '</',
    contains: [
      API_CLASS,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        variants: [
          {
            begin: '@"', end: '"',
            illegal: '\\n',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          {
            begin: '\'', end: '[^\\\\]\'',
            illegal: '[^\\\\][^\']'
          }
        ]
      },
      {
        className: 'meta',
        begin: '#',
        end: '$',
        contains: [
          {
            className: 'string',
            variants: [
              { begin: '\"', end: '\"' },
              { begin: '<', end: '>' }
            ]
          }
        ]
      },
      {
        className: 'class',
        begin: '(' + CLASS_KEYWORDS.split(' ').join('|') + ')\\b', end: '({|$)', excludeEnd: true,
        keywords: CLASS_KEYWORDS, lexemes: LEXEMES,
        contains: [
          hljs.UNDERSCORE_TITLE_MODE
        ]
      },
      {
        begin: '\\.'+hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
},{name:"powershell",create:/*
Language: PowerShell
Author: David Mohundro <david@mohundro.com>
Contributors: Nicholas Blumhardt <nblumhardt@nblumhardt.com>
*/

function(hljs) {
  var backtickEscape = {
    begin: '`[\\s\\S]',
    relevance: 0
  };
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$[\w\d][\w\d_:]*/}
    ]
  };
  var LITERAL = {
    className: 'literal',
    begin: /\$(null|true|false)\b/
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: /"/, end: /"/,
    contains: [
      backtickEscape,
      VAR,
      {
        className: 'variable',
        begin: /\$[A-z]/, end: /[^A-z]/
      }
    ]
  };
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };

  return {
    aliases: ['ps'],
    lexemes: /-?[A-z\.\-]+/,
    case_insensitive: true,
    keywords: {
      keyword: 'if else foreach return function do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catch',
      built_in: 'Add-Content Add-History Add-Member Add-PSSnapin Clear-Content Clear-Item Clear-Item Property Clear-Variable Compare-Object ConvertFrom-SecureString Convert-Path ConvertTo-Html ConvertTo-SecureString Copy-Item Copy-ItemProperty Export-Alias Export-Clixml Export-Console Export-Csv ForEach-Object Format-Custom Format-List Format-Table Format-Wide Get-Acl Get-Alias Get-AuthenticodeSignature Get-ChildItem Get-Command Get-Content Get-Credential Get-Culture Get-Date Get-EventLog Get-ExecutionPolicy Get-Help Get-History Get-Host Get-Item Get-ItemProperty Get-Location Get-Member Get-PfxCertificate Get-Process Get-PSDrive Get-PSProvider Get-PSSnapin Get-Service Get-TraceSource Get-UICulture Get-Unique Get-Variable Get-WmiObject Group-Object Import-Alias Import-Clixml Import-Csv Invoke-Expression Invoke-History Invoke-Item Join-Path Measure-Command Measure-Object Move-Item Move-ItemProperty New-Alias New-Item New-ItemProperty New-Object New-PSDrive New-Service New-TimeSpan New-Variable Out-Default Out-File Out-Host Out-Null Out-Printer Out-String Pop-Location Push-Location Read-Host Remove-Item Remove-ItemProperty Remove-PSDrive Remove-PSSnapin Remove-Variable Rename-Item Rename-ItemProperty Resolve-Path Restart-Service Resume-Service Select-Object Select-String Set-Acl Set-Alias Set-AuthenticodeSignature Set-Content Set-Date Set-ExecutionPolicy Set-Item Set-ItemProperty Set-Location Set-PSDebug Set-Service Set-TraceSource Set-Variable Sort-Object Split-Path Start-Service Start-Sleep Start-Transcript Stop-Process Stop-Service Stop-Transcript Suspend-Service Tee-Object Test-Path Trace-Command Update-FormatData Update-TypeData Where-Object Write-Debug Write-Error Write-Host Write-Output Write-Progress Write-Verbose Write-Warning',
      nomarkup: '-ne -eq -lt -gt -ge -le -not -like -notlike -match -notmatch -contains -notcontains -in -notin -replace'
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      hljs.NUMBER_MODE,
      QUOTE_STRING,
      APOS_STRING,
      LITERAL,
      VAR
    ]
  };
}
},{name:"cs",create:/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
Category: common
*/

function(hljs) {
  var KEYWORDS =
    // Normal keywords.
    'abstract as base bool break byte case catch char checked const continue decimal dynamic ' +
    'default delegate do double else enum event explicit extern false finally fixed float ' +
    'for foreach goto if implicit in int interface internal is lock long null when ' +
    'object operator out override params private protected public readonly ref sbyte ' +
    'sealed short sizeof stackalloc static string struct switch this true try typeof ' +
    'uint ulong unchecked unsafe ushort using virtual volatile void while async ' +
    'protected public private internal ' +
    // Contextual keywords.
    'ascending descending from get group into join let orderby partial select set value var ' +
    'where yield';
  var GENERIC_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '>)?';
  return {
    aliases: ['csharp'],
    keywords: KEYWORDS,
    illegal: /::/,
    contains: [
      hljs.COMMENT(
        '///',
        '$',
        {
          returnBegin: true,
          contains: [
            {
              className: 'doctag',
              variants: [
                {
                  begin: '///', relevance: 0
                },
                {
                  begin: '<!--|-->'
                },
                {
                  begin: '</?', end: '>'
                }
              ]
            }
          ]
        }
      ),
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'meta',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        className: 'string',
        begin: '@"', end: '"',
        contains: [{begin: '""'}]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      {
        beginKeywords: 'class interface', end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          hljs.TITLE_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: 'namespace', end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: '[a-zA-Z](\\.?\\w)*'}),
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new return throw await',
        relevance: 0
      },
      {
        className: 'function',
        begin: '(' + GENERIC_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*\\(', returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [
          {
            begin: hljs.IDENT_RE + '\\s*\\(', returnBegin: true,
            contains: [hljs.TITLE_MODE],
            relevance: 0
          },
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            relevance: 0,
            contains: [
              hljs.APOS_STRING_MODE,
              hljs.QUOTE_STRING_MODE,
              hljs.C_NUMBER_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ]
          },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE
        ]
      }
    ]
  };
}
},{name:"sql",create:/*
 Language: SQL
 Contributors: Nikolay Lisienko <info@neor.ru>, Heiko August <post@auge8472.de>, Travis Odom <travis.a.odom@gmail.com>, Vadimtro <vadimtro@yahoo.com>, Benjamin Auder <benjamin.auder@gmail.com>
 Category: common
 */

function(hljs) {
  var COMMENT_MODE = hljs.COMMENT('--', '$');
  return {
    case_insensitive: true,
    illegal: /[<>{}*]/,
    contains: [
      {
        beginKeywords:
          'begin end start commit rollback savepoint lock alter create drop rename call ' +
          'delete do handler insert load replace select truncate update set show pragma grant ' +
          'merge describe use explain help declare prepare execute deallocate release ' +
          'unlock purge reset change stop analyze cache flush optimize repair kill ' +
          'install uninstall checksum restore check backup revoke',
        end: /;/, endsWithParent: true,
        keywords: {
          keyword:
            'abort abs absolute acc acce accep accept access accessed accessible account acos action activate add ' +
            'addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias ' +
            'allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply ' +
            'archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan ' +
            'atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid ' +
            'authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile ' +
            'before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float ' +
            'binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound ' +
            'buffer_cache buffer_pool build bulk by byte byteordermark bytes c cache caching call calling cancel ' +
            'capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base ' +
            'char_length character_length characters characterset charindex charset charsetform charsetid check ' +
            'checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close ' +
            'cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation ' +
            'collect colu colum column column_value columns columns_updated comment commit compact compatibility ' +
            'compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn ' +
            'connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection ' +
            'consider consistent constant constraint constraints constructor container content contents context ' +
            'contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost ' +
            'count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation ' +
            'critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user ' +
            'cursor curtime customdatum cycle d data database databases datafile datafiles datalength date_add ' +
            'date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts ' +
            'day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate ' +
            'declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults ' +
            'deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank ' +
            'depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor ' +
            'deterministic diagnostics difference dimension direct_load directory disable disable_all ' +
            'disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div ' +
            'do document domain dotnet double downgrade drop dumpfile duplicate duration e each edition editionable ' +
            'editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt ' +
            'end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors ' +
            'escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding ' +
            'execu execut execute exempt exists exit exp expire explain export export_set extended extent external ' +
            'external_1 external_2 externally extract f failed failed_login_attempts failover failure far fast ' +
            'feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final ' +
            'finish first first_value fixed flash_cache flashback floor flush following follows for forall force ' +
            'form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ' +
            'ftp full function g general generated get get_format get_lock getdate getutcdate global global_name ' +
            'globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups ' +
            'gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex ' +
            'hierarchy high high_priority hosts hour http i id ident_current ident_incr ident_seed identified ' +
            'identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment ' +
            'index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile ' +
            'initial initialized initially initrans inmemory inner innodb input insert install instance instantiable ' +
            'instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat ' +
            'is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists ' +
            'k keep keep_duplicates key keys kill l language large last last_day last_insert_id last_value lax lcase ' +
            'lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit ' +
            'lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate ' +
            'locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call ' +
            'logoff logon logs long loop low low_priority lower lpad lrtrim ltrim m main make_set makedate maketime ' +
            'managed management manual map mapping mask master master_pos_wait match matched materialized max ' +
            'maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans ' +
            'md5 measures median medium member memcompress memory merge microsecond mid migration min minextents ' +
            'minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month ' +
            'months mount move movement multiset mutex n name name_const names nan national native natural nav nchar ' +
            'nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile ' +
            'nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile ' +
            'nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder ' +
            'nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck ' +
            'noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe ' +
            'nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ' +
            'ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old ' +
            'on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date ' +
            'oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary ' +
            'out outer outfile outline output over overflow overriding p package pad parallel parallel_enable ' +
            'parameters parent parse partial partition partitions pascal passing password password_grace_time ' +
            'password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex ' +
            'pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc ' +
            'performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin ' +
            'policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction ' +
            'prediction_cost prediction_details prediction_probability prediction_set prepare present preserve ' +
            'prior priority private private_sga privileges procedural procedure procedure_analyze processlist ' +
            'profiles project prompt protection public publishingservername purge quarter query quick quiesce quota ' +
            'quotename radians raise rand range rank raw read reads readsize rebuild record records ' +
            'recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh ' +
            'regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy ' +
            'reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename ' +
            'repair repeat replace replicate replication required reset resetlogs resize resource respect restore ' +
            'restricted result result_cache resumable resume retention return returning returns reuse reverse revoke ' +
            'right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows ' +
            'rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll ' +
            'sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select ' +
            'self sequence sequential serializable server servererror session session_user sessions_per_user set ' +
            'sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor ' +
            'si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin ' +
            'size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex ' +
            'source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows ' +
            'sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone ' +
            'standby start starting startup statement static statistics stats_binomial_test stats_crosstab ' +
            'stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep ' +
            'stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev ' +
            'stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate ' +
            'subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum ' +
            'suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate ' +
            'sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime t table tables tablespace tan tdo ' +
            'template temporary terminated tertiary_weights test than then thread through tier ties time time_format ' +
            'time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr ' +
            'timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking ' +
            'transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate ' +
            'try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress ' +
            'under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot ' +
            'unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert ' +
            'url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date ' +
            'utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var ' +
            'var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray ' +
            'verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear ' +
            'wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped ' +
            'xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces ' +
            'xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek',
          literal:
            'true false null',
          built_in:
            'array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number ' +
            'numeric real record serial serial8 smallint text varchar varying void'
        },
        contains: [
          {
            className: 'string',
            begin: '\'', end: '\'',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}]
          },
          {
            className: 'string',
            begin: '"', end: '"',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '""'}]
          },
          {
            className: 'string',
            begin: '`', end: '`',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          hljs.C_NUMBER_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          COMMENT_MODE
        ]
      },
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE
    ]
  };
}
},{name:"xml",create:/*
Language: HTML, XML
Category: common
*/

function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var PHP = {
    begin: /<\?(php)?(?!\w)/, end: /\?>/,
    subLanguage: 'php'
  };
  var TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      PHP,
      {
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '=',
        relevance: 0,
        contains: [
          {
            className: 'string',
            contains: [PHP],
            variants: [
              {begin: /"/, end: /"/},
              {begin: /'/, end: /'/},
              {begin: /[^\s\/>]+/}
            ]
          }
        ]
      }
    ]
  };
  return {
    aliases: ['html', 'xhtml', 'rss', 'atom', 'xsl', 'plist'],
    case_insensitive: true,
    contains: [
      {
        className: 'meta',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      hljs.COMMENT(
        '<!--',
        '-->',
        {
          relevance: 10
        }
      ),
      {
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {name: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {name: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '\<\/script\>', returnEnd: true,
          subLanguage: ['actionscript', 'javascript', 'handlebars']
        }
      },
      PHP,
      {
        className: 'meta',
        begin: /<\?\w+/, end: /\?>/,
        relevance: 10
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'name', begin: /[^ \/><\n\t]+/, relevance: 0
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
}
},{name:"css",create:/*
Language: CSS
Category: common, css
*/

function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var RULE = {
    begin: /[A-Z\_\.\-]+\s*:/, returnBegin: true, end: ';', endsWithParent: true,
    contains: [
      {
        className: 'attribute',
        begin: /\S/, end: ':', excludeEnd: true,
        starts: {
          endsWithParent: true, excludeEnd: true,
          contains: [
            hljs.CSS_NUMBER_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            {
              className: 'number', begin: '#[0-9A-Fa-f]+'
            },
            {
              className: 'meta', begin: '!important'
            }
          ]
        }
      }
    ]
  };

  return {
    case_insensitive: true,
    illegal: /[=\/|'\$]/,
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'selector-id', begin: /#[A-Za-z0-9_-]+/
      },
      {
        className: 'selector-class', begin: /\.[A-Za-z0-9_-]+/
      },
      {
        className: 'selector-attr',
        begin: /\[/, end: /\]/,
        illegal: '$'
      },
      {
        // pseudo element
        begin: /:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/
      },
      {
        begin: '@(font-face|page)',
        lexemes: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        contains: [
          {
            className: 'keyword',
            begin: /\S+/
          },
          {
            begin: /\s/, endsWithParent: true, excludeEnd: true,
            relevance: 0,
            contains: [
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
              hljs.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: 'selector-tag', begin: IDENT_RE,
        relevance: 0
      },
      {
        begin: '{', end: '}',
        illegal: /\S/,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          RULE,
        ]
      }
    ]
  };
}
},{name:"scala",create:/*
Language: Scala
Category: functional
Author: Jan Berkel <jan.berkel@gmail.com>
Contributors: Erik Osheim <d_m@plastic-idolatry.com>
*/

function(hljs) {

  var ANNOTATION = { className: 'meta', begin: '@[A-Za-z]+' };

  // used in strings for escaping/interpolation/substitution
  var SUBST = {
    className: 'subst',
    variants: [
      {begin: '\\$[A-Za-z0-9_]+'},
      {begin: '\\${', end: '}'}
    ]
  };

  var STRING = {
    className: 'string',
    variants: [
      {
        begin: '"', end: '"',
        illegal: '\\n',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '"""', end: '"""',
        relevance: 10
      },
      {
        begin: '[a-z]+"', end: '"',
        illegal: '\\n',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
      },
      {
        className: 'string',
        begin: '[a-z]+"""', end: '"""',
        contains: [SUBST],
        relevance: 10
      }
    ]

  };

  var SYMBOL = {
    className: 'symbol',
    begin: '\'\\w[\\w\\d_]*(?!\')'
  };

  var TYPE = {
    className: 'type',
    begin: '\\b[A-Z][A-Za-z0-9_]*',
    relevance: 0
  };

  var NAME = {
    className: 'title',
    begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
    relevance: 0
  };

  var CLASS = {
    className: 'class',
    beginKeywords: 'class object trait type',
    end: /[:={\[\n;]/,
    excludeEnd: true,
    contains: [
      {
        beginKeywords: 'extends with',
        relevance: 10
      },
      {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        relevance: 0
      },
      NAME
    ]
  };

  var METHOD = {
    className: 'function',
    beginKeywords: 'def',
    end: /[:={\[(\n;]/,
    contains: [NAME]
  };

  return {
    keywords: {
      literal: 'true false null',
      keyword: 'type yield lazy override def with val var sealed abstract private trait object if forSome for while throw finally protected extends import final return else break new catch super class case package default try this match continue throws implicit'
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      STRING,
      SYMBOL,
      TYPE,
      METHOD,
      CLASS,
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
}
},{name:"coffeescript",create:/*
Language: CoffeeScript
Author: Dmytrii Nagirniak <dnagir@gmail.com>
Contributors: Oleg Efimov <efimovov@gmail.com>, Cédric Néhémie <cedric.nehemie@gmail.com>
Description: CoffeeScript is a programming language that transcompiles to JavaScript. For info about language see http://coffeescript.org/
Category: common, scripting
*/

function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off',
    built_in:
      'npm require console print module global window document'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var SUBST = {
    className: 'subst',
    begin: /#\{/, end: /}/,
    keywords: KEYWORDS
  };
  var EXPRESSIONS = [
    hljs.BINARY_NUMBER_MODE,
    hljs.inherit(hljs.C_NUMBER_MODE, {starts: {end: '(\\s*/)?', relevance: 0}}), // a number tries to eat the following slash to prevent treating it as a regexp
    {
      className: 'string',
      variants: [
        {
          begin: /'''/, end: /'''/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /'/, end: /'/,
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        {
          begin: /"""/, end: /"""/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        },
        {
          begin: /"/, end: /"/,
          contains: [hljs.BACKSLASH_ESCAPE, SUBST]
        }
      ]
    },
    {
      className: 'regexp',
      variants: [
        {
          begin: '///', end: '///',
          contains: [SUBST, hljs.HASH_COMMENT_MODE]
        },
        {
          begin: '//[gim]*',
          relevance: 0
        },
        {
          // regex can't start with space to parse x / 2 / 3 as two divisions
          // regex can't start with *, and it supports an "illegal" in the main mode
          begin: /\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/
        }
      ]
    },
    {
      begin: '@' + JS_IDENT_RE // relevance booster
    },
    {
      begin: '`', end: '`',
      excludeBegin: true, excludeEnd: true,
      subLanguage: 'javascript'
    }
  ];
  SUBST.contains = EXPRESSIONS;

  var TITLE = hljs.inherit(hljs.TITLE_MODE, {begin: JS_IDENT_RE});
  var PARAMS_RE = '(\\(.*\\))?\\s*\\B[-=]>';
  var PARAMS = {
    className: 'params',
    begin: '\\([^\\(]', returnBegin: true,
    /* We need another contained nameless mode to not have every nested
    pair of parens to be called "params" */
    contains: [{
      begin: /\(/, end: /\)/,
      keywords: KEYWORDS,
      contains: ['self'].concat(EXPRESSIONS)
    }]
  };

  return {
    aliases: ['coffee', 'cson', 'iced'],
    keywords: KEYWORDS,
    illegal: /\/\*/,
    contains: EXPRESSIONS.concat([
      hljs.COMMENT('###', '###'),
      hljs.HASH_COMMENT_MODE,
      {
        className: 'function',
        begin: '^\\s*' + JS_IDENT_RE + '\\s*=\\s*' + PARAMS_RE, end: '[-=]>',
        returnBegin: true,
        contains: [TITLE, PARAMS]
      },
      {
        // anonymous function start
        begin: /[:\(,=]\s*/,
        relevance: 0,
        contains: [
          {
            className: 'function',
            begin: PARAMS_RE, end: '[-=]>',
            returnBegin: true,
            contains: [PARAMS]
          }
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class',
        end: '$',
        illegal: /[:="\[\]]/,
        contains: [
          {
            beginKeywords: 'extends',
            endsWithParent: true,
            illegal: /[:="\[\]]/,
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        begin: JS_IDENT_RE + ':', end: ':',
        returnBegin: true, returnEnd: true,
        relevance: 0
      }
    ])
  };
}
},{name:"lisp",create:/*
Language: Lisp
Description: Generic lisp syntax
Author: Vasily Polovnyov <vast@whiteants.net>
Category: lisp
*/

function(hljs) {
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#!]*';
  var MEC_RE = '\\|[^]*?\\|';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s|D|E|F|L|S)(\\+|\\-)?\\d+)?';
  var SHEBANG = {
    className: 'meta',
    begin: '^#!', end: '$'
  };
  var LITERAL = {
    className: 'literal',
    begin: '\\b(t{1}|nil)\\b'
  };
  var NUMBER = {
    className: 'number',
    variants: [
      {begin: LISP_SIMPLE_NUMBER_RE, relevance: 0},
      {begin: '#(b|B)[0-1]+(/[0-1]+)?'},
      {begin: '#(o|O)[0-7]+(/[0-7]+)?'},
      {begin: '#(x|X)[0-9a-fA-F]+(/[0-9a-fA-F]+)?'},
      {begin: '#(c|C)\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'}
    ]
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = hljs.COMMENT(
    ';', '$',
    {
      relevance: 0
    }
  );
  var VARIABLE = {
    begin: '\\*', end: '\\*'
  };
  var KEYWORD = {
    className: 'symbol',
    begin: '[:&]' + LISP_IDENT_RE
  };
  var IDENT = {
    begin: LISP_IDENT_RE,
    relevance: 0
  };
  var MEC = {
    begin: MEC_RE
  };
  var QUOTED_LIST = {
    begin: '\\(', end: '\\)',
    contains: ['self', LITERAL, STRING, NUMBER, IDENT]
  };
  var QUOTED = {
    contains: [NUMBER, STRING, VARIABLE, KEYWORD, QUOTED_LIST, IDENT],
    variants: [
      {
        begin: '[\'`]\\(', end: '\\)'
      },
      {
        begin: '\\(quote ', end: '\\)',
        keywords: {name: 'quote'}
      },
      {
        begin: '\'' + MEC_RE
      }
    ]
  };
  var QUOTED_ATOM = {
    variants: [
      {begin: '\'' + LISP_IDENT_RE},
      {begin: '#\'' + LISP_IDENT_RE + '(::' + LISP_IDENT_RE + ')*'}
    ]
  };
  var LIST = {
    begin: '\\(\\s*', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    relevance: 0
  };
  LIST.contains = [
    {
      className: 'name',
      variants: [
        {begin: LISP_IDENT_RE},
        {begin: MEC_RE}
      ]
    },
    BODY
  ];
  BODY.contains = [QUOTED, QUOTED_ATOM, LIST, LITERAL, NUMBER, STRING, COMMENT, VARIABLE, KEYWORD, MEC, IDENT];

  return {
    illegal: /\S/,
    contains: [
      NUMBER,
      SHEBANG,
      LITERAL,
      STRING,
      COMMENT,
      QUOTED,
      QUOTED_ATOM,
      LIST,
      IDENT
    ]
  };
}
},{name:"clojure",create:/*
Language: Clojure
Description: Clojure syntax (based on lisp.js)
Author: mfornos
Category: lisp
*/

function(hljs) {
  var keywords = {
    built_in:
      // Clojure keywords
      'def defonce cond apply if-not if-let if not not= = < > <= >= == + / * - rem '+
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for dosync and or '+
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
      'refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
      'assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger '+
      'bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline '+
      'flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking '+
      'assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
      'new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty '+
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
   };

  var SYMBOLSTART = 'a-zA-Z_\\-!.?+*=<>&#\'';
  var SYMBOL_RE = '[' + SYMBOLSTART + '][' + SYMBOLSTART + '0-9/;:]*';
  var SIMPLE_NUMBER_RE = '[-+]?\\d+(\\.\\d+)?';

  var SYMBOL = {
    begin: SYMBOL_RE,
    relevance: 0
  };
  var NUMBER = {
    className: 'number', begin: SIMPLE_NUMBER_RE,
    relevance: 0
  };
  var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
  var COMMENT = hljs.COMMENT(
    ';',
    '$',
    {
      relevance: 0
    }
  );
  var LITERAL = {
    className: 'literal',
    begin: /\b(true|false|nil)\b/
  };
  var COLLECTION = {
    begin: '[\\[\\{]', end: '[\\]\\}]'
  };
  var HINT = {
    className: 'comment',
    begin: '\\^' + SYMBOL_RE
  };
  var HINT_COL = hljs.COMMENT('\\^\\{', '\\}');
  var KEY = {
    className: 'symbol',
    begin: '[:]' + SYMBOL_RE
  };
  var LIST = {
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    endsWithParent: true,
    relevance: 0
  };
  var NAME = {
    keywords: keywords,
    lexemes: SYMBOL_RE,
    className: 'name', begin: SYMBOL_RE,
    starts: BODY
  };
  var DEFAULT_CONTAINS = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER, LITERAL, SYMBOL];

  LIST.contains = [hljs.COMMENT('comment', ''), NAME, BODY];
  BODY.contains = DEFAULT_CONTAINS;
  COLLECTION.contains = DEFAULT_CONTAINS;

  return {
    aliases: ['clj'],
    illegal: /\S/,
    contains: [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER, LITERAL]
  }
}
},{name:"http",create:/*
Language: HTTP
Description: HTTP request and response headers with automatic body highlighting
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Category: common, protocols
*/

function(hljs) {
  var VERSION = 'HTTP/[0-9\\.]+';
  return {
    aliases: ['https'],
    illegal: '\\S',
    contains: [
      {
        begin: '^' + VERSION, end: '$',
        contains: [{className: 'number', begin: '\\b\\d{3}\\b'}]
      },
      {
        begin: '^[A-Z]+ (.*?) ' + VERSION + '$', returnBegin: true, end: '$',
        contains: [
          {
            className: 'string',
            begin: ' ', end: ' ',
            excludeBegin: true, excludeEnd: true
          },
          {
            begin: VERSION
          },
          {
            className: 'keyword',
            begin: '[A-Z]+'
          }
        ]
      },
      {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: {end: '$', relevance: 0}
      },
      {
        begin: '\\n\\n',
        starts: {subLanguage: [], endsWithParent: true}
      }
    ]
  };
}
},{name:"haskell",create:/*
Language: Haskell
Author: Jeremy Hull <sourdrums@gmail.com>
Contributors: Zena Treep <zena.treep@gmail.com>
Category: functional
*/

function(hljs) {
  var COMMENT = {
    variants: [
      hljs.COMMENT('--', '$'),
      hljs.COMMENT(
        '{-',
        '-}',
        {
          contains: ['self']
        }
      )
    ]
  };

  var PRAGMA = {
    className: 'meta',
    begin: '{-#', end: '#-}'
  };

  var PREPROCESSOR = {
    className: 'meta',
    begin: '^#', end: '$'
  };

  var CONSTRUCTOR = {
    className: 'type',
    begin: '\\b[A-Z][\\w\']*', // TODO: other constructors (build-in, infix).
    relevance: 0
  };

  var LIST = {
    begin: '\\(', end: '\\)',
    illegal: '"',
    contains: [
      PRAGMA,
      PREPROCESSOR,
      {className: 'type', begin: '\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?'},
      hljs.inherit(hljs.TITLE_MODE, {begin: '[_a-z][\\w\']*'}),
      COMMENT
    ]
  };

  var RECORD = {
    begin: '{', end: '}',
    contains: LIST.contains
  };

  return {
    aliases: ['hs'],
    keywords:
      'let in if then else case of where do module import hiding ' +
      'qualified type data newtype deriving class instance as default ' +
      'infix infixl infixr foreign export ccall stdcall cplusplus ' +
      'jvm dotnet safe unsafe family forall mdo proc rec',
    contains: [

      // Top-level constructions.

      {
        beginKeywords: 'module', end: 'where',
        keywords: 'module where',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },
      {
        begin: '\\bimport\\b', end: '$',
        keywords: 'import qualified as hiding',
        contains: [LIST, COMMENT],
        illegal: '\\W\\.|;'
      },

      {
        className: 'class',
        begin: '^(\\s*)?(class|instance)\\b', end: 'where',
        keywords: 'class family instance where',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        className: 'class',
        begin: '\\b(data|(new)?type)\\b', end: '$',
        keywords: 'data family type newtype deriving',
        contains: [PRAGMA, CONSTRUCTOR, LIST, RECORD, COMMENT]
      },
      {
        beginKeywords: 'default', end: '$',
        contains: [CONSTRUCTOR, LIST, COMMENT]
      },
      {
        beginKeywords: 'infix infixl infixr', end: '$',
        contains: [hljs.C_NUMBER_MODE, COMMENT]
      },
      {
        begin: '\\bforeign\\b', end: '$',
        keywords: 'foreign import export ccall stdcall cplusplus jvm ' +
                  'dotnet safe unsafe',
        contains: [CONSTRUCTOR, hljs.QUOTE_STRING_MODE, COMMENT]
      },
      {
        className: 'meta',
        begin: '#!\\/usr\\/bin\\/env\ runhaskell', end: '$'
      },

      // "Whitespaces".

      PRAGMA,
      PREPROCESSOR,

      // Literals and names.

      // TODO: characters.
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE,
      CONSTRUCTOR,
      hljs.inherit(hljs.TITLE_MODE, {begin: '^[_a-z][\\w\']*'}),

      COMMENT,

      {begin: '->|<-'} // No markup, relevance booster
    ]
  };
}
},{name:"vim",create:/*
Language: Vim Script
Author: Jun Yang <yangjvn@126.com>
Description: full keyword and built-in from http://vimdoc.sourceforge.net/htmldoc/
Category: scripting
*/

function(hljs) {
  return {
    lexemes: /[!#@\w]+/,
    keywords: {
      keyword: //ex command
        // express version except: ! & * < = > !! # @ @@
        'N|0 P|0 X|0 a|0 ab abc abo al am an|0 ar arga argd arge argdo argg argl argu as au aug aun b|0 bN ba bad bd be bel bf bl bm bn bo bp br brea breaka breakd breakl bro bufdo buffers bun bw c|0 cN cNf ca cabc caddb cad caddf cal cat cb cc ccl cd ce cex cf cfir cgetb cgete cg changes chd che checkt cl cla clo cm cmapc cme cn cnew cnf cno cnorea cnoreme co col colo com comc comp con conf cope '+
        'cp cpf cq cr cs cst cu cuna cunme cw d|0 delm deb debugg delc delf dif diffg diffo diffp diffpu diffs diffthis dig di dl dell dj dli do doautoa dp dr ds dsp e|0 ea ec echoe echoh echom echon el elsei em en endfo endf endt endw ene ex exe exi exu f|0 files filet fin fina fini fir fix fo foldc foldd folddoc foldo for fu g|0 go gr grepa gu gv ha h|0 helpf helpg helpt hi hid his i|0 ia iabc if ij il im imapc '+
        'ime ino inorea inoreme int is isp iu iuna iunme j|0 ju k|0 keepa kee keepj lN lNf l|0 lad laddb laddf la lan lat lb lc lch lcl lcs le lefta let lex lf lfir lgetb lgete lg lgr lgrepa lh ll lla lli lmak lm lmapc lne lnew lnf ln loadk lo loc lockv lol lope lp lpf lr ls lt lu lua luad luaf lv lvimgrepa lw m|0 ma mak map mapc marks mat me menut mes mk mks mksp mkv mkvie mod mz mzf nbc nb nbs n|0 new nm nmapc nme nn nnoreme noa no noh norea noreme norm nu nun nunme ol o|0 om omapc ome on ono onoreme opt ou ounme ow p|0 '+
        'profd prof pro promptr pc ped pe perld po popu pp pre prev ps pt ptN ptf ptj ptl ptn ptp ptr pts pu pw py3 python3 py3d py3f py pyd pyf q|0 quita qa r|0 rec red redi redr redraws reg res ret retu rew ri rightb rub rubyd rubyf rund ru rv s|0 sN san sa sal sav sb sbN sba sbf sbl sbm sbn sbp sbr scrip scripte scs se setf setg setl sf sfir sh sim sig sil sl sla sm smap smapc sme sn sni sno snor snoreme sor '+
        'so spelld spe spelli spellr spellu spellw sp spr sre st sta startg startr star stopi stj sts sun sunm sunme sus sv sw sy synti sync t|0 tN tabN tabc tabdo tabe tabf tabfir tabl tabm tabnew '+
        'tabn tabo tabp tabr tabs tab ta tags tc tcld tclf te tf th tj tl tm tn to tp tr try ts tu u|0 undoj undol una unh unl unlo unm unme uns up v|0 ve verb vert vim vimgrepa vi viu vie vm vmapc vme vne vn vnoreme vs vu vunme windo w|0 wN wa wh wi winc winp wn wp wq wqa ws wu wv x|0 xa xmapc xm xme xn xnoreme xu xunme y|0 z|0 ~ '+
        // full version
        'Next Print append abbreviate abclear aboveleft all amenu anoremenu args argadd argdelete argedit argglobal arglocal argument ascii autocmd augroup aunmenu buffer bNext ball badd bdelete behave belowright bfirst blast bmodified bnext botright bprevious brewind break breakadd breakdel breaklist browse bunload '+
        'bwipeout change cNext cNfile cabbrev cabclear caddbuffer caddexpr caddfile call catch cbuffer cclose center cexpr cfile cfirst cgetbuffer cgetexpr cgetfile chdir checkpath checktime clist clast close cmap cmapclear cmenu cnext cnewer cnfile cnoremap cnoreabbrev cnoremenu copy colder colorscheme command comclear compiler continue confirm copen cprevious cpfile cquit crewind cscope cstag cunmap '+
        'cunabbrev cunmenu cwindow delete delmarks debug debuggreedy delcommand delfunction diffupdate diffget diffoff diffpatch diffput diffsplit digraphs display deletel djump dlist doautocmd doautoall deletep drop dsearch dsplit edit earlier echo echoerr echohl echomsg else elseif emenu endif endfor '+
        'endfunction endtry endwhile enew execute exit exusage file filetype find finally finish first fixdel fold foldclose folddoopen folddoclosed foldopen function global goto grep grepadd gui gvim hardcopy help helpfind helpgrep helptags highlight hide history insert iabbrev iabclear ijump ilist imap '+
        'imapclear imenu inoremap inoreabbrev inoremenu intro isearch isplit iunmap iunabbrev iunmenu join jumps keepalt keepmarks keepjumps lNext lNfile list laddexpr laddbuffer laddfile last language later lbuffer lcd lchdir lclose lcscope left leftabove lexpr lfile lfirst lgetbuffer lgetexpr lgetfile lgrep lgrepadd lhelpgrep llast llist lmake lmap lmapclear lnext lnewer lnfile lnoremap loadkeymap loadview '+
        'lockmarks lockvar lolder lopen lprevious lpfile lrewind ltag lunmap luado luafile lvimgrep lvimgrepadd lwindow move mark make mapclear match menu menutranslate messages mkexrc mksession mkspell mkvimrc mkview mode mzscheme mzfile nbclose nbkey nbsart next nmap nmapclear nmenu nnoremap '+
        'nnoremenu noautocmd noremap nohlsearch noreabbrev noremenu normal number nunmap nunmenu oldfiles open omap omapclear omenu only onoremap onoremenu options ounmap ounmenu ownsyntax print profdel profile promptfind promptrepl pclose pedit perl perldo pop popup ppop preserve previous psearch ptag ptNext '+
        'ptfirst ptjump ptlast ptnext ptprevious ptrewind ptselect put pwd py3do py3file python pydo pyfile quit quitall qall read recover redo redir redraw redrawstatus registers resize retab return rewind right rightbelow ruby rubydo rubyfile rundo runtime rviminfo substitute sNext sandbox sargument sall saveas sbuffer sbNext sball sbfirst sblast sbmodified sbnext sbprevious sbrewind scriptnames scriptencoding '+
        'scscope set setfiletype setglobal setlocal sfind sfirst shell simalt sign silent sleep slast smagic smapclear smenu snext sniff snomagic snoremap snoremenu sort source spelldump spellgood spellinfo spellrepall spellundo spellwrong split sprevious srewind stop stag startgreplace startreplace '+
        'startinsert stopinsert stjump stselect sunhide sunmap sunmenu suspend sview swapname syntax syntime syncbind tNext tabNext tabclose tabedit tabfind tabfirst tablast tabmove tabnext tabonly tabprevious tabrewind tag tcl tcldo tclfile tearoff tfirst throw tjump tlast tmenu tnext topleft tprevious '+'trewind tselect tunmenu undo undojoin undolist unabbreviate unhide unlet unlockvar unmap unmenu unsilent update vglobal version verbose vertical vimgrep vimgrepadd visual viusage view vmap vmapclear vmenu vnew '+
        'vnoremap vnoremenu vsplit vunmap vunmenu write wNext wall while winsize wincmd winpos wnext wprevious wqall wsverb wundo wviminfo xit xall xmapclear xmap xmenu xnoremap xnoremenu xunmap xunmenu yank',
      built_in: //built in func
        'abs acos add and append argc argidx argv asin atan atan2 browse browsedir bufexists buflisted bufloaded bufname bufnr bufwinnr byte2line byteidx call ceil changenr char2nr cindent clearmatches col complete complete_add complete_check confirm copy cos cosh count cscope_connection cursor '+
        'deepcopy delete did_filetype diff_filler diff_hlID empty escape eval eventhandler executable exists exp expand extend feedkeys filereadable filewritable filter finddir findfile float2nr floor fmod fnameescape fnamemodify foldclosed foldclosedend foldlevel foldtext foldtextresult foreground function '+
        'garbagecollect get getbufline getbufvar getchar getcharmod getcmdline getcmdpos getcmdtype getcwd getfontname getfperm getfsize getftime getftype getline getloclist getmatches getpid getpos getqflist getreg getregtype gettabvar gettabwinvar getwinposx getwinposy getwinvar glob globpath has has_key '+
        'haslocaldir hasmapto histadd histdel histget histnr hlexists hlID hostname iconv indent index input inputdialog inputlist inputrestore inputsave inputsecret insert invert isdirectory islocked items join keys len libcall libcallnr line line2byte lispindent localtime log log10 luaeval map maparg mapcheck '+
        'match matchadd matcharg matchdelete matchend matchlist matchstr max min mkdir mode mzeval nextnonblank nr2char or pathshorten pow prevnonblank printf pumvisible py3eval pyeval range readfile reltime reltimestr remote_expr remote_foreground remote_peek remote_read remote_send remove rename repeat '+
        'resolve reverse round screenattr screenchar screencol screenrow search searchdecl searchpair searchpairpos searchpos server2client serverlist setbufvar setcmdpos setline setloclist setmatches setpos setqflist setreg settabvar settabwinvar setwinvar sha256 shellescape shiftwidth simplify sin '+
        'sinh sort soundfold spellbadword spellsuggest split sqrt str2float str2nr strchars strdisplaywidth strftime stridx string strlen strpart strridx strtrans strwidth submatch substitute synconcealed synID synIDattr '+
        'synIDtrans synstack system tabpagebuflist tabpagenr tabpagewinnr tagfiles taglist tan tanh tempname tolower toupper tr trunc type undofile undotree values virtcol visualmode wildmenumode winbufnr wincol winheight winline winnr winrestcmd winrestview winsaveview winwidth writefile xor'
    },
    illegal: /[{:]/,
    contains: [
      hljs.NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        // quote with escape, comment as quote
        begin: /"((\\")|[^"\n])*("|\n)/
      },
      {
        className: 'variable',
        begin: /[bwtglsav]:[\w\d_]*/
      },
      {
        className: 'function',
        beginKeywords: 'function function!', end: '$',
        relevance: 0,
        contains: [
          hljs.TITLE_MODE,
          {
            className: 'params',
            begin: '\\(', end: '\\)'
          }
        ]
      }
    ]
  };
}
}]
  ;

for (var i = 0; i < languages.length; ++i) {
  hljs.registerLanguage(languages[i].name, languages[i].create);
}

module.exports = {
  styles: {"agate":".hljs-agate{/*! * Agate by Taufik Nurrohman <https://github.com/tovic> * ---------------------------------------------------- * * #ade5fc * #a2fca2 * #c6b4f0 * #d36363 * #fcc28c * #fc9b9b * #ffa * #fff * #333 * #62c8f3 * #888 * */}.hljs-agate .hljs{display:block;overflow-x:auto;padding:.5em;background:#333;color:white}.hljs-agate .hljs-name,.hljs-agate .hljs-strong{font-weight:bold}.hljs-agate .hljs-code,.hljs-agate .hljs-emphasis{font-style:italic}.hljs-agate .hljs-tag{color:#62c8f3}.hljs-agate .hljs-variable,.hljs-agate .hljs-template-variable,.hljs-agate .hljs-selector-id,.hljs-agate .hljs-selector-class{color:#ade5fc}.hljs-agate .hljs-string,.hljs-agate .hljs-bullet{color:#a2fca2}.hljs-agate .hljs-type,.hljs-agate .hljs-title,.hljs-agate .hljs-section,.hljs-agate .hljs-attribute,.hljs-agate .hljs-quote,.hljs-agate .hljs-built_in{color:#ffa}.hljs-agate .hljs-number,.hljs-agate .hljs-symbol,.hljs-agate .hljs-bullet{color:#d36363}.hljs-agate .hljs-keyword,.hljs-agate .hljs-selector-tag,.hljs-agate .hljs-literal{color:#fcc28c}.hljs-agate .hljs-comment,.hljs-agate .hljs-deletion,.hljs-agate .hljs-code{color:#888}.hljs-agate .hljs-regexp,.hljs-agate .hljs-link{color:#c6b4f0}.hljs-agate .hljs-meta{color:#fc9b9b}.hljs-agate .hljs-deletion{background-color:#fc9b9b;color:#333}.hljs-agate .hljs-addition{background-color:#a2fca2;color:#333}.hljs-agate .hljs a{color:inherit}.hljs-agate .hljs a:focus,.hljs-agate .hljs a:hover{color:inherit;text-decoration:underline}","androidstudio":".hljs-androidstudio .hljs{color:#a9b7c6;background:#282b2e;display:block;overflow-x:auto;padding:.5em}.hljs-androidstudio .hljs-number,.hljs-androidstudio .hljs-literal,.hljs-androidstudio .hljs-symbol,.hljs-androidstudio .hljs-bullet{color:#6897BB}.hljs-androidstudio .hljs-keyword,.hljs-androidstudio .hljs-selector-tag,.hljs-androidstudio .hljs-deletion{color:#cc7832}.hljs-androidstudio .hljs-variable,.hljs-androidstudio .hljs-template-variable,.hljs-androidstudio .hljs-link{color:#629755}.hljs-androidstudio .hljs-comment,.hljs-androidstudio .hljs-quote{color:#808080}.hljs-androidstudio .hljs-meta{color:#bbb529}.hljs-androidstudio .hljs-string,.hljs-androidstudio .hljs-attribute,.hljs-androidstudio .hljs-addition{color:#6A8759}.hljs-androidstudio .hljs-section,.hljs-androidstudio .hljs-title,.hljs-androidstudio .hljs-type{color:#ffc66d}.hljs-androidstudio .hljs-name,.hljs-androidstudio .hljs-selector-id,.hljs-androidstudio .hljs-selector-class{color:#e8bf6a}.hljs-androidstudio .hljs-emphasis{font-style:italic}.hljs-androidstudio .hljs-strong{font-weight:bold}","arta":".hljs-arta .hljs{display:block;overflow-x:auto;padding:.5em;background:#222}.hljs-arta .hljs,.hljs-arta .hljs-subst{color:#aaa}.hljs-arta .hljs-section{color:#fff}.hljs-arta .hljs-comment,.hljs-arta .hljs-quote,.hljs-arta .hljs-meta{color:#444}.hljs-arta .hljs-string,.hljs-arta .hljs-symbol,.hljs-arta .hljs-bullet,.hljs-arta .hljs-regexp{color:#ffcc33}.hljs-arta .hljs-number,.hljs-arta .hljs-addition{color:#00cc66}.hljs-arta .hljs-built_in,.hljs-arta .hljs-literal,.hljs-arta .hljs-type,.hljs-arta .hljs-template-variable,.hljs-arta .hljs-attribute,.hljs-arta .hljs-link{color:#32aaee}.hljs-arta .hljs-keyword,.hljs-arta .hljs-selector-tag,.hljs-arta .hljs-name,.hljs-arta .hljs-selector-id,.hljs-arta .hljs-selector-class{color:#6644aa}.hljs-arta .hljs-title,.hljs-arta .hljs-variable,.hljs-arta .hljs-deletion,.hljs-arta .hljs-template-tag{color:#bb1166}.hljs-arta .hljs-section,.hljs-arta .hljs-doctag,.hljs-arta .hljs-strong{font-weight:bold}.hljs-arta .hljs-emphasis{font-style:italic}","ascetic":".hljs-ascetic .hljs{display:block;overflow-x:auto;padding:.5em;background:white;color:black}.hljs-ascetic .hljs-string,.hljs-ascetic .hljs-variable,.hljs-ascetic .hljs-template-variable,.hljs-ascetic .hljs-symbol,.hljs-ascetic .hljs-bullet,.hljs-ascetic .hljs-section,.hljs-ascetic .hljs-addition,.hljs-ascetic .hljs-attribute,.hljs-ascetic .hljs-link{color:#888}.hljs-ascetic .hljs-comment,.hljs-ascetic .hljs-quote,.hljs-ascetic .hljs-meta,.hljs-ascetic .hljs-deletion{color:#ccc}.hljs-ascetic .hljs-keyword,.hljs-ascetic .hljs-selector-tag,.hljs-ascetic .hljs-section,.hljs-ascetic .hljs-name,.hljs-ascetic .hljs-type,.hljs-ascetic .hljs-strong{font-weight:bold}.hljs-ascetic .hljs-emphasis{font-style:italic}","atelier-cave-dark":".hljs-atelier-cave-dark .hljs-comment,.hljs-atelier-cave-dark .hljs-quote{color:#7e7887}.hljs-atelier-cave-dark .hljs-variable,.hljs-atelier-cave-dark .hljs-template-variable,.hljs-atelier-cave-dark .hljs-attribute,.hljs-atelier-cave-dark .hljs-regexp,.hljs-atelier-cave-dark .hljs-link,.hljs-atelier-cave-dark .hljs-tag,.hljs-atelier-cave-dark .hljs-name,.hljs-atelier-cave-dark .hljs-selector-id,.hljs-atelier-cave-dark .hljs-selector-class{color:#be4678}.hljs-atelier-cave-dark .hljs-number,.hljs-atelier-cave-dark .hljs-meta,.hljs-atelier-cave-dark .hljs-built_in,.hljs-atelier-cave-dark .hljs-literal,.hljs-atelier-cave-dark .hljs-type,.hljs-atelier-cave-dark .hljs-params{color:#aa573c}.hljs-atelier-cave-dark .hljs-string,.hljs-atelier-cave-dark .hljs-symbol,.hljs-atelier-cave-dark .hljs-bullet{color:#2a9292}.hljs-atelier-cave-dark .hljs-title,.hljs-atelier-cave-dark .hljs-section{color:#576ddb}.hljs-atelier-cave-dark .hljs-keyword,.hljs-atelier-cave-dark .hljs-selector-tag{color:#955ae7}.hljs-atelier-cave-dark .hljs-deletion,.hljs-atelier-cave-dark .hljs-addition{color:#19171c;display:inline-block;width:100%}.hljs-atelier-cave-dark .hljs-deletion{background-color:#be4678}.hljs-atelier-cave-dark .hljs-addition{background-color:#2a9292}.hljs-atelier-cave-dark .hljs{display:block;overflow-x:auto;background:#19171c;color:#8b8792;padding:.5em}.hljs-atelier-cave-dark .hljs-emphasis{font-style:italic}.hljs-atelier-cave-dark .hljs-strong{font-weight:bold}","atelier-cave-light":".hljs-atelier-cave-light .hljs-comment,.hljs-atelier-cave-light .hljs-quote{color:#655f6d}.hljs-atelier-cave-light .hljs-variable,.hljs-atelier-cave-light .hljs-template-variable,.hljs-atelier-cave-light .hljs-attribute,.hljs-atelier-cave-light .hljs-tag,.hljs-atelier-cave-light .hljs-name,.hljs-atelier-cave-light .hljs-regexp,.hljs-atelier-cave-light .hljs-link,.hljs-atelier-cave-light .hljs-name,.hljs-atelier-cave-light .hljs-name,.hljs-atelier-cave-light .hljs-selector-id,.hljs-atelier-cave-light .hljs-selector-class{color:#be4678}.hljs-atelier-cave-light .hljs-number,.hljs-atelier-cave-light .hljs-meta,.hljs-atelier-cave-light .hljs-built_in,.hljs-atelier-cave-light .hljs-literal,.hljs-atelier-cave-light .hljs-type,.hljs-atelier-cave-light .hljs-params{color:#aa573c}.hljs-atelier-cave-light .hljs-string,.hljs-atelier-cave-light .hljs-symbol,.hljs-atelier-cave-light .hljs-bullet{color:#2a9292}.hljs-atelier-cave-light .hljs-title,.hljs-atelier-cave-light .hljs-section{color:#576ddb}.hljs-atelier-cave-light .hljs-keyword,.hljs-atelier-cave-light .hljs-selector-tag{color:#955ae7}.hljs-atelier-cave-light .hljs-deletion,.hljs-atelier-cave-light .hljs-addition{color:#19171c;display:inline-block;width:100%}.hljs-atelier-cave-light .hljs-deletion{background-color:#be4678}.hljs-atelier-cave-light .hljs-addition{background-color:#2a9292}.hljs-atelier-cave-light .hljs{display:block;overflow-x:auto;background:#efecf4;color:#585260;padding:.5em}.hljs-atelier-cave-light .hljs-emphasis{font-style:italic}.hljs-atelier-cave-light .hljs-strong{font-weight:bold}","atelier-dune-dark":".hljs-atelier-dune-dark .hljs-comment,.hljs-atelier-dune-dark .hljs-quote{color:#999580}.hljs-atelier-dune-dark .hljs-variable,.hljs-atelier-dune-dark .hljs-template-variable,.hljs-atelier-dune-dark .hljs-attribute,.hljs-atelier-dune-dark .hljs-tag,.hljs-atelier-dune-dark .hljs-name,.hljs-atelier-dune-dark .hljs-regexp,.hljs-atelier-dune-dark .hljs-link,.hljs-atelier-dune-dark .hljs-name,.hljs-atelier-dune-dark .hljs-selector-id,.hljs-atelier-dune-dark .hljs-selector-class{color:#d73737}.hljs-atelier-dune-dark .hljs-number,.hljs-atelier-dune-dark .hljs-meta,.hljs-atelier-dune-dark .hljs-built_in,.hljs-atelier-dune-dark .hljs-literal,.hljs-atelier-dune-dark .hljs-type,.hljs-atelier-dune-dark .hljs-params{color:#b65611}.hljs-atelier-dune-dark .hljs-string,.hljs-atelier-dune-dark .hljs-symbol,.hljs-atelier-dune-dark .hljs-bullet{color:#60ac39}.hljs-atelier-dune-dark .hljs-title,.hljs-atelier-dune-dark .hljs-section{color:#6684e1}.hljs-atelier-dune-dark .hljs-keyword,.hljs-atelier-dune-dark .hljs-selector-tag{color:#b854d4}.hljs-atelier-dune-dark .hljs{display:block;overflow-x:auto;background:#20201d;color:#a6a28c;padding:.5em}.hljs-atelier-dune-dark .hljs-emphasis{font-style:italic}.hljs-atelier-dune-dark .hljs-strong{font-weight:bold}","atelier-dune-light":".hljs-atelier-dune-light .hljs-comment,.hljs-atelier-dune-light .hljs-quote{color:#7d7a68}.hljs-atelier-dune-light .hljs-variable,.hljs-atelier-dune-light .hljs-template-variable,.hljs-atelier-dune-light .hljs-attribute,.hljs-atelier-dune-light .hljs-tag,.hljs-atelier-dune-light .hljs-name,.hljs-atelier-dune-light .hljs-regexp,.hljs-atelier-dune-light .hljs-link,.hljs-atelier-dune-light .hljs-name,.hljs-atelier-dune-light .hljs-selector-id,.hljs-atelier-dune-light .hljs-selector-class{color:#d73737}.hljs-atelier-dune-light .hljs-number,.hljs-atelier-dune-light .hljs-meta,.hljs-atelier-dune-light .hljs-built_in,.hljs-atelier-dune-light .hljs-literal,.hljs-atelier-dune-light .hljs-type,.hljs-atelier-dune-light .hljs-params{color:#b65611}.hljs-atelier-dune-light .hljs-string,.hljs-atelier-dune-light .hljs-symbol,.hljs-atelier-dune-light .hljs-bullet{color:#60ac39}.hljs-atelier-dune-light .hljs-title,.hljs-atelier-dune-light .hljs-section{color:#6684e1}.hljs-atelier-dune-light .hljs-keyword,.hljs-atelier-dune-light .hljs-selector-tag{color:#b854d4}.hljs-atelier-dune-light .hljs{display:block;overflow-x:auto;background:#fefbec;color:#6e6b5e;padding:.5em}.hljs-atelier-dune-light .hljs-emphasis{font-style:italic}.hljs-atelier-dune-light .hljs-strong{font-weight:bold}","atelier-estuary-dark":".hljs-atelier-estuary-dark .hljs-comment,.hljs-atelier-estuary-dark .hljs-quote{color:#878573}.hljs-atelier-estuary-dark .hljs-variable,.hljs-atelier-estuary-dark .hljs-template-variable,.hljs-atelier-estuary-dark .hljs-attribute,.hljs-atelier-estuary-dark .hljs-tag,.hljs-atelier-estuary-dark .hljs-name,.hljs-atelier-estuary-dark .hljs-regexp,.hljs-atelier-estuary-dark .hljs-link,.hljs-atelier-estuary-dark .hljs-name,.hljs-atelier-estuary-dark .hljs-selector-id,.hljs-atelier-estuary-dark .hljs-selector-class{color:#ba6236}.hljs-atelier-estuary-dark .hljs-number,.hljs-atelier-estuary-dark .hljs-meta,.hljs-atelier-estuary-dark .hljs-built_in,.hljs-atelier-estuary-dark .hljs-literal,.hljs-atelier-estuary-dark .hljs-type,.hljs-atelier-estuary-dark .hljs-params{color:#ae7313}.hljs-atelier-estuary-dark .hljs-string,.hljs-atelier-estuary-dark .hljs-symbol,.hljs-atelier-estuary-dark .hljs-bullet{color:#7d9726}.hljs-atelier-estuary-dark .hljs-title,.hljs-atelier-estuary-dark .hljs-section{color:#36a166}.hljs-atelier-estuary-dark .hljs-keyword,.hljs-atelier-estuary-dark .hljs-selector-tag{color:#5f9182}.hljs-atelier-estuary-dark .hljs-deletion,.hljs-atelier-estuary-dark .hljs-addition{color:#22221b;display:inline-block;width:100%}.hljs-atelier-estuary-dark .hljs-deletion{background-color:#ba6236}.hljs-atelier-estuary-dark .hljs-addition{background-color:#7d9726}.hljs-atelier-estuary-dark .hljs{display:block;overflow-x:auto;background:#22221b;color:#929181;padding:.5em}.hljs-atelier-estuary-dark .hljs-emphasis{font-style:italic}.hljs-atelier-estuary-dark .hljs-strong{font-weight:bold}","atelier-estuary-light":".hljs-atelier-estuary-light .hljs-comment,.hljs-atelier-estuary-light .hljs-quote{color:#6c6b5a}.hljs-atelier-estuary-light .hljs-variable,.hljs-atelier-estuary-light .hljs-template-variable,.hljs-atelier-estuary-light .hljs-attribute,.hljs-atelier-estuary-light .hljs-tag,.hljs-atelier-estuary-light .hljs-name,.hljs-atelier-estuary-light .hljs-regexp,.hljs-atelier-estuary-light .hljs-link,.hljs-atelier-estuary-light .hljs-name,.hljs-atelier-estuary-light .hljs-selector-id,.hljs-atelier-estuary-light .hljs-selector-class{color:#ba6236}.hljs-atelier-estuary-light .hljs-number,.hljs-atelier-estuary-light .hljs-meta,.hljs-atelier-estuary-light .hljs-built_in,.hljs-atelier-estuary-light .hljs-literal,.hljs-atelier-estuary-light .hljs-type,.hljs-atelier-estuary-light .hljs-params{color:#ae7313}.hljs-atelier-estuary-light .hljs-string,.hljs-atelier-estuary-light .hljs-symbol,.hljs-atelier-estuary-light .hljs-bullet{color:#7d9726}.hljs-atelier-estuary-light .hljs-title,.hljs-atelier-estuary-light .hljs-section{color:#36a166}.hljs-atelier-estuary-light .hljs-keyword,.hljs-atelier-estuary-light .hljs-selector-tag{color:#5f9182}.hljs-atelier-estuary-light .hljs-deletion,.hljs-atelier-estuary-light .hljs-addition{color:#22221b;display:inline-block;width:100%}.hljs-atelier-estuary-light .hljs-deletion{background-color:#ba6236}.hljs-atelier-estuary-light .hljs-addition{background-color:#7d9726}.hljs-atelier-estuary-light .hljs{display:block;overflow-x:auto;background:#f4f3ec;color:#5f5e4e;padding:.5em}.hljs-atelier-estuary-light .hljs-emphasis{font-style:italic}.hljs-atelier-estuary-light .hljs-strong{font-weight:bold}","atelier-forest-dark":".hljs-atelier-forest-dark .hljs-comment,.hljs-atelier-forest-dark .hljs-quote{color:#9c9491}.hljs-atelier-forest-dark .hljs-variable,.hljs-atelier-forest-dark .hljs-template-variable,.hljs-atelier-forest-dark .hljs-attribute,.hljs-atelier-forest-dark .hljs-tag,.hljs-atelier-forest-dark .hljs-name,.hljs-atelier-forest-dark .hljs-regexp,.hljs-atelier-forest-dark .hljs-link,.hljs-atelier-forest-dark .hljs-name,.hljs-atelier-forest-dark .hljs-selector-id,.hljs-atelier-forest-dark .hljs-selector-class{color:#f22c40}.hljs-atelier-forest-dark .hljs-number,.hljs-atelier-forest-dark .hljs-meta,.hljs-atelier-forest-dark .hljs-built_in,.hljs-atelier-forest-dark .hljs-literal,.hljs-atelier-forest-dark .hljs-type,.hljs-atelier-forest-dark .hljs-params{color:#df5320}.hljs-atelier-forest-dark .hljs-string,.hljs-atelier-forest-dark .hljs-symbol,.hljs-atelier-forest-dark .hljs-bullet{color:#7b9726}.hljs-atelier-forest-dark .hljs-title,.hljs-atelier-forest-dark .hljs-section{color:#407ee7}.hljs-atelier-forest-dark .hljs-keyword,.hljs-atelier-forest-dark .hljs-selector-tag{color:#6666ea}.hljs-atelier-forest-dark .hljs{display:block;overflow-x:auto;background:#1b1918;color:#a8a19f;padding:.5em}.hljs-atelier-forest-dark .hljs-emphasis{font-style:italic}.hljs-atelier-forest-dark .hljs-strong{font-weight:bold}","atelier-forest-light":".hljs-atelier-forest-light .hljs-comment,.hljs-atelier-forest-light .hljs-quote{color:#766e6b}.hljs-atelier-forest-light .hljs-variable,.hljs-atelier-forest-light .hljs-template-variable,.hljs-atelier-forest-light .hljs-attribute,.hljs-atelier-forest-light .hljs-tag,.hljs-atelier-forest-light .hljs-name,.hljs-atelier-forest-light .hljs-regexp,.hljs-atelier-forest-light .hljs-link,.hljs-atelier-forest-light .hljs-name,.hljs-atelier-forest-light .hljs-selector-id,.hljs-atelier-forest-light .hljs-selector-class{color:#f22c40}.hljs-atelier-forest-light .hljs-number,.hljs-atelier-forest-light .hljs-meta,.hljs-atelier-forest-light .hljs-built_in,.hljs-atelier-forest-light .hljs-literal,.hljs-atelier-forest-light .hljs-type,.hljs-atelier-forest-light .hljs-params{color:#df5320}.hljs-atelier-forest-light .hljs-string,.hljs-atelier-forest-light .hljs-symbol,.hljs-atelier-forest-light .hljs-bullet{color:#7b9726}.hljs-atelier-forest-light .hljs-title,.hljs-atelier-forest-light .hljs-section{color:#407ee7}.hljs-atelier-forest-light .hljs-keyword,.hljs-atelier-forest-light .hljs-selector-tag{color:#6666ea}.hljs-atelier-forest-light .hljs{display:block;overflow-x:auto;background:#f1efee;color:#68615e;padding:.5em}.hljs-atelier-forest-light .hljs-emphasis{font-style:italic}.hljs-atelier-forest-light .hljs-strong{font-weight:bold}","atelier-heath-dark":".hljs-atelier-heath-dark .hljs-comment,.hljs-atelier-heath-dark .hljs-quote{color:#9e8f9e}.hljs-atelier-heath-dark .hljs-variable,.hljs-atelier-heath-dark .hljs-template-variable,.hljs-atelier-heath-dark .hljs-attribute,.hljs-atelier-heath-dark .hljs-tag,.hljs-atelier-heath-dark .hljs-name,.hljs-atelier-heath-dark .hljs-regexp,.hljs-atelier-heath-dark .hljs-link,.hljs-atelier-heath-dark .hljs-name,.hljs-atelier-heath-dark .hljs-selector-id,.hljs-atelier-heath-dark .hljs-selector-class{color:#ca402b}.hljs-atelier-heath-dark .hljs-number,.hljs-atelier-heath-dark .hljs-meta,.hljs-atelier-heath-dark .hljs-built_in,.hljs-atelier-heath-dark .hljs-literal,.hljs-atelier-heath-dark .hljs-type,.hljs-atelier-heath-dark .hljs-params{color:#a65926}.hljs-atelier-heath-dark .hljs-string,.hljs-atelier-heath-dark .hljs-symbol,.hljs-atelier-heath-dark .hljs-bullet{color:#918b3b}.hljs-atelier-heath-dark .hljs-title,.hljs-atelier-heath-dark .hljs-section{color:#516aec}.hljs-atelier-heath-dark .hljs-keyword,.hljs-atelier-heath-dark .hljs-selector-tag{color:#7b59c0}.hljs-atelier-heath-dark .hljs{display:block;overflow-x:auto;background:#1b181b;color:#ab9bab;padding:.5em}.hljs-atelier-heath-dark .hljs-emphasis{font-style:italic}.hljs-atelier-heath-dark .hljs-strong{font-weight:bold}","atelier-heath-light":".hljs-atelier-heath-light .hljs-comment,.hljs-atelier-heath-light .hljs-quote{color:#776977}.hljs-atelier-heath-light .hljs-variable,.hljs-atelier-heath-light .hljs-template-variable,.hljs-atelier-heath-light .hljs-attribute,.hljs-atelier-heath-light .hljs-tag,.hljs-atelier-heath-light .hljs-name,.hljs-atelier-heath-light .hljs-regexp,.hljs-atelier-heath-light .hljs-link,.hljs-atelier-heath-light .hljs-name,.hljs-atelier-heath-light .hljs-selector-id,.hljs-atelier-heath-light .hljs-selector-class{color:#ca402b}.hljs-atelier-heath-light .hljs-number,.hljs-atelier-heath-light .hljs-meta,.hljs-atelier-heath-light .hljs-built_in,.hljs-atelier-heath-light .hljs-literal,.hljs-atelier-heath-light .hljs-type,.hljs-atelier-heath-light .hljs-params{color:#a65926}.hljs-atelier-heath-light .hljs-string,.hljs-atelier-heath-light .hljs-symbol,.hljs-atelier-heath-light .hljs-bullet{color:#918b3b}.hljs-atelier-heath-light .hljs-title,.hljs-atelier-heath-light .hljs-section{color:#516aec}.hljs-atelier-heath-light .hljs-keyword,.hljs-atelier-heath-light .hljs-selector-tag{color:#7b59c0}.hljs-atelier-heath-light .hljs{display:block;overflow-x:auto;background:#f7f3f7;color:#695d69;padding:.5em}.hljs-atelier-heath-light .hljs-emphasis{font-style:italic}.hljs-atelier-heath-light .hljs-strong{font-weight:bold}","atelier-lakeside-dark":".hljs-atelier-lakeside-dark .hljs-comment,.hljs-atelier-lakeside-dark .hljs-quote{color:#7195a8}.hljs-atelier-lakeside-dark .hljs-variable,.hljs-atelier-lakeside-dark .hljs-template-variable,.hljs-atelier-lakeside-dark .hljs-attribute,.hljs-atelier-lakeside-dark .hljs-tag,.hljs-atelier-lakeside-dark .hljs-name,.hljs-atelier-lakeside-dark .hljs-regexp,.hljs-atelier-lakeside-dark .hljs-link,.hljs-atelier-lakeside-dark .hljs-name,.hljs-atelier-lakeside-dark .hljs-selector-id,.hljs-atelier-lakeside-dark .hljs-selector-class{color:#d22d72}.hljs-atelier-lakeside-dark .hljs-number,.hljs-atelier-lakeside-dark .hljs-meta,.hljs-atelier-lakeside-dark .hljs-built_in,.hljs-atelier-lakeside-dark .hljs-literal,.hljs-atelier-lakeside-dark .hljs-type,.hljs-atelier-lakeside-dark .hljs-params{color:#935c25}.hljs-atelier-lakeside-dark .hljs-string,.hljs-atelier-lakeside-dark .hljs-symbol,.hljs-atelier-lakeside-dark .hljs-bullet{color:#568c3b}.hljs-atelier-lakeside-dark .hljs-title,.hljs-atelier-lakeside-dark .hljs-section{color:#257fad}.hljs-atelier-lakeside-dark .hljs-keyword,.hljs-atelier-lakeside-dark .hljs-selector-tag{color:#6b6bb8}.hljs-atelier-lakeside-dark .hljs{display:block;overflow-x:auto;background:#161b1d;color:#7ea2b4;padding:.5em}.hljs-atelier-lakeside-dark .hljs-emphasis{font-style:italic}.hljs-atelier-lakeside-dark .hljs-strong{font-weight:bold}","atelier-lakeside-light":".hljs-atelier-lakeside-light .hljs-comment,.hljs-atelier-lakeside-light .hljs-quote{color:#5a7b8c}.hljs-atelier-lakeside-light .hljs-variable,.hljs-atelier-lakeside-light .hljs-template-variable,.hljs-atelier-lakeside-light .hljs-attribute,.hljs-atelier-lakeside-light .hljs-tag,.hljs-atelier-lakeside-light .hljs-name,.hljs-atelier-lakeside-light .hljs-regexp,.hljs-atelier-lakeside-light .hljs-link,.hljs-atelier-lakeside-light .hljs-name,.hljs-atelier-lakeside-light .hljs-selector-id,.hljs-atelier-lakeside-light .hljs-selector-class{color:#d22d72}.hljs-atelier-lakeside-light .hljs-number,.hljs-atelier-lakeside-light .hljs-meta,.hljs-atelier-lakeside-light .hljs-built_in,.hljs-atelier-lakeside-light .hljs-literal,.hljs-atelier-lakeside-light .hljs-type,.hljs-atelier-lakeside-light .hljs-params{color:#935c25}.hljs-atelier-lakeside-light .hljs-string,.hljs-atelier-lakeside-light .hljs-symbol,.hljs-atelier-lakeside-light .hljs-bullet{color:#568c3b}.hljs-atelier-lakeside-light .hljs-title,.hljs-atelier-lakeside-light .hljs-section{color:#257fad}.hljs-atelier-lakeside-light .hljs-keyword,.hljs-atelier-lakeside-light .hljs-selector-tag{color:#6b6bb8}.hljs-atelier-lakeside-light .hljs{display:block;overflow-x:auto;background:#ebf8ff;color:#516d7b;padding:.5em}.hljs-atelier-lakeside-light .hljs-emphasis{font-style:italic}.hljs-atelier-lakeside-light .hljs-strong{font-weight:bold}","atelier-plateau-dark":".hljs-atelier-plateau-dark .hljs-comment,.hljs-atelier-plateau-dark .hljs-quote{color:#7e7777}.hljs-atelier-plateau-dark .hljs-variable,.hljs-atelier-plateau-dark .hljs-template-variable,.hljs-atelier-plateau-dark .hljs-attribute,.hljs-atelier-plateau-dark .hljs-tag,.hljs-atelier-plateau-dark .hljs-name,.hljs-atelier-plateau-dark .hljs-regexp,.hljs-atelier-plateau-dark .hljs-link,.hljs-atelier-plateau-dark .hljs-name,.hljs-atelier-plateau-dark .hljs-selector-id,.hljs-atelier-plateau-dark .hljs-selector-class{color:#ca4949}.hljs-atelier-plateau-dark .hljs-number,.hljs-atelier-plateau-dark .hljs-meta,.hljs-atelier-plateau-dark .hljs-built_in,.hljs-atelier-plateau-dark .hljs-literal,.hljs-atelier-plateau-dark .hljs-type,.hljs-atelier-plateau-dark .hljs-params{color:#b45a3c}.hljs-atelier-plateau-dark .hljs-string,.hljs-atelier-plateau-dark .hljs-symbol,.hljs-atelier-plateau-dark .hljs-bullet{color:#4b8b8b}.hljs-atelier-plateau-dark .hljs-title,.hljs-atelier-plateau-dark .hljs-section{color:#7272ca}.hljs-atelier-plateau-dark .hljs-keyword,.hljs-atelier-plateau-dark .hljs-selector-tag{color:#8464c4}.hljs-atelier-plateau-dark .hljs-deletion,.hljs-atelier-plateau-dark .hljs-addition{color:#1b1818;display:inline-block;width:100%}.hljs-atelier-plateau-dark .hljs-deletion{background-color:#ca4949}.hljs-atelier-plateau-dark .hljs-addition{background-color:#4b8b8b}.hljs-atelier-plateau-dark .hljs{display:block;overflow-x:auto;background:#1b1818;color:#8a8585;padding:.5em}.hljs-atelier-plateau-dark .hljs-emphasis{font-style:italic}.hljs-atelier-plateau-dark .hljs-strong{font-weight:bold}","atelier-plateau-light":".hljs-atelier-plateau-light .hljs-comment,.hljs-atelier-plateau-light .hljs-quote{color:#655d5d}.hljs-atelier-plateau-light .hljs-variable,.hljs-atelier-plateau-light .hljs-template-variable,.hljs-atelier-plateau-light .hljs-attribute,.hljs-atelier-plateau-light .hljs-tag,.hljs-atelier-plateau-light .hljs-name,.hljs-atelier-plateau-light .hljs-regexp,.hljs-atelier-plateau-light .hljs-link,.hljs-atelier-plateau-light .hljs-name,.hljs-atelier-plateau-light .hljs-selector-id,.hljs-atelier-plateau-light .hljs-selector-class{color:#ca4949}.hljs-atelier-plateau-light .hljs-number,.hljs-atelier-plateau-light .hljs-meta,.hljs-atelier-plateau-light .hljs-built_in,.hljs-atelier-plateau-light .hljs-literal,.hljs-atelier-plateau-light .hljs-type,.hljs-atelier-plateau-light .hljs-params{color:#b45a3c}.hljs-atelier-plateau-light .hljs-string,.hljs-atelier-plateau-light .hljs-symbol,.hljs-atelier-plateau-light .hljs-bullet{color:#4b8b8b}.hljs-atelier-plateau-light .hljs-title,.hljs-atelier-plateau-light .hljs-section{color:#7272ca}.hljs-atelier-plateau-light .hljs-keyword,.hljs-atelier-plateau-light .hljs-selector-tag{color:#8464c4}.hljs-atelier-plateau-light .hljs-deletion,.hljs-atelier-plateau-light .hljs-addition{color:#1b1818;display:inline-block;width:100%}.hljs-atelier-plateau-light .hljs-deletion{background-color:#ca4949}.hljs-atelier-plateau-light .hljs-addition{background-color:#4b8b8b}.hljs-atelier-plateau-light .hljs{display:block;overflow-x:auto;background:#f4ecec;color:#585050;padding:.5em}.hljs-atelier-plateau-light .hljs-emphasis{font-style:italic}.hljs-atelier-plateau-light .hljs-strong{font-weight:bold}","atelier-savanna-dark":".hljs-atelier-savanna-dark .hljs-comment,.hljs-atelier-savanna-dark .hljs-quote{color:#78877d}.hljs-atelier-savanna-dark .hljs-variable,.hljs-atelier-savanna-dark .hljs-template-variable,.hljs-atelier-savanna-dark .hljs-attribute,.hljs-atelier-savanna-dark .hljs-tag,.hljs-atelier-savanna-dark .hljs-name,.hljs-atelier-savanna-dark .hljs-regexp,.hljs-atelier-savanna-dark .hljs-link,.hljs-atelier-savanna-dark .hljs-name,.hljs-atelier-savanna-dark .hljs-selector-id,.hljs-atelier-savanna-dark .hljs-selector-class{color:#b16139}.hljs-atelier-savanna-dark .hljs-number,.hljs-atelier-savanna-dark .hljs-meta,.hljs-atelier-savanna-dark .hljs-built_in,.hljs-atelier-savanna-dark .hljs-literal,.hljs-atelier-savanna-dark .hljs-type,.hljs-atelier-savanna-dark .hljs-params{color:#9f713c}.hljs-atelier-savanna-dark .hljs-string,.hljs-atelier-savanna-dark .hljs-symbol,.hljs-atelier-savanna-dark .hljs-bullet{color:#489963}.hljs-atelier-savanna-dark .hljs-title,.hljs-atelier-savanna-dark .hljs-section{color:#478c90}.hljs-atelier-savanna-dark .hljs-keyword,.hljs-atelier-savanna-dark .hljs-selector-tag{color:#55859b}.hljs-atelier-savanna-dark .hljs-deletion,.hljs-atelier-savanna-dark .hljs-addition{color:#171c19;display:inline-block;width:100%}.hljs-atelier-savanna-dark .hljs-deletion{background-color:#b16139}.hljs-atelier-savanna-dark .hljs-addition{background-color:#489963}.hljs-atelier-savanna-dark .hljs{display:block;overflow-x:auto;background:#171c19;color:#87928a;padding:.5em}.hljs-atelier-savanna-dark .hljs-emphasis{font-style:italic}.hljs-atelier-savanna-dark .hljs-strong{font-weight:bold}","atelier-savanna-light":".hljs-atelier-savanna-light .hljs-comment,.hljs-atelier-savanna-light .hljs-quote{color:#5f6d64}.hljs-atelier-savanna-light .hljs-variable,.hljs-atelier-savanna-light .hljs-template-variable,.hljs-atelier-savanna-light .hljs-attribute,.hljs-atelier-savanna-light .hljs-tag,.hljs-atelier-savanna-light .hljs-name,.hljs-atelier-savanna-light .hljs-regexp,.hljs-atelier-savanna-light .hljs-link,.hljs-atelier-savanna-light .hljs-name,.hljs-atelier-savanna-light .hljs-selector-id,.hljs-atelier-savanna-light .hljs-selector-class{color:#b16139}.hljs-atelier-savanna-light .hljs-number,.hljs-atelier-savanna-light .hljs-meta,.hljs-atelier-savanna-light .hljs-built_in,.hljs-atelier-savanna-light .hljs-literal,.hljs-atelier-savanna-light .hljs-type,.hljs-atelier-savanna-light .hljs-params{color:#9f713c}.hljs-atelier-savanna-light .hljs-string,.hljs-atelier-savanna-light .hljs-symbol,.hljs-atelier-savanna-light .hljs-bullet{color:#489963}.hljs-atelier-savanna-light .hljs-title,.hljs-atelier-savanna-light .hljs-section{color:#478c90}.hljs-atelier-savanna-light .hljs-keyword,.hljs-atelier-savanna-light .hljs-selector-tag{color:#55859b}.hljs-atelier-savanna-light .hljs-deletion,.hljs-atelier-savanna-light .hljs-addition{color:#171c19;display:inline-block;width:100%}.hljs-atelier-savanna-light .hljs-deletion{background-color:#b16139}.hljs-atelier-savanna-light .hljs-addition{background-color:#489963}.hljs-atelier-savanna-light .hljs{display:block;overflow-x:auto;background:#ecf4ee;color:#526057;padding:.5em}.hljs-atelier-savanna-light .hljs-emphasis{font-style:italic}.hljs-atelier-savanna-light .hljs-strong{font-weight:bold}","atelier-seaside-dark":".hljs-atelier-seaside-dark .hljs-comment,.hljs-atelier-seaside-dark .hljs-quote{color:#809980}.hljs-atelier-seaside-dark .hljs-variable,.hljs-atelier-seaside-dark .hljs-template-variable,.hljs-atelier-seaside-dark .hljs-attribute,.hljs-atelier-seaside-dark .hljs-tag,.hljs-atelier-seaside-dark .hljs-name,.hljs-atelier-seaside-dark .hljs-regexp,.hljs-atelier-seaside-dark .hljs-link,.hljs-atelier-seaside-dark .hljs-name,.hljs-atelier-seaside-dark .hljs-selector-id,.hljs-atelier-seaside-dark .hljs-selector-class{color:#e6193c}.hljs-atelier-seaside-dark .hljs-number,.hljs-atelier-seaside-dark .hljs-meta,.hljs-atelier-seaside-dark .hljs-built_in,.hljs-atelier-seaside-dark .hljs-literal,.hljs-atelier-seaside-dark .hljs-type,.hljs-atelier-seaside-dark .hljs-params{color:#87711d}.hljs-atelier-seaside-dark .hljs-string,.hljs-atelier-seaside-dark .hljs-symbol,.hljs-atelier-seaside-dark .hljs-bullet{color:#29a329}.hljs-atelier-seaside-dark .hljs-title,.hljs-atelier-seaside-dark .hljs-section{color:#3d62f5}.hljs-atelier-seaside-dark .hljs-keyword,.hljs-atelier-seaside-dark .hljs-selector-tag{color:#ad2bee}.hljs-atelier-seaside-dark .hljs{display:block;overflow-x:auto;background:#131513;color:#8ca68c;padding:.5em}.hljs-atelier-seaside-dark .hljs-emphasis{font-style:italic}.hljs-atelier-seaside-dark .hljs-strong{font-weight:bold}","atelier-seaside-light":".hljs-atelier-seaside-light .hljs-comment,.hljs-atelier-seaside-light .hljs-quote{color:#687d68}.hljs-atelier-seaside-light .hljs-variable,.hljs-atelier-seaside-light .hljs-template-variable,.hljs-atelier-seaside-light .hljs-attribute,.hljs-atelier-seaside-light .hljs-tag,.hljs-atelier-seaside-light .hljs-name,.hljs-atelier-seaside-light .hljs-regexp,.hljs-atelier-seaside-light .hljs-link,.hljs-atelier-seaside-light .hljs-name,.hljs-atelier-seaside-light .hljs-selector-id,.hljs-atelier-seaside-light .hljs-selector-class{color:#e6193c}.hljs-atelier-seaside-light .hljs-number,.hljs-atelier-seaside-light .hljs-meta,.hljs-atelier-seaside-light .hljs-built_in,.hljs-atelier-seaside-light .hljs-literal,.hljs-atelier-seaside-light .hljs-type,.hljs-atelier-seaside-light .hljs-params{color:#87711d}.hljs-atelier-seaside-light .hljs-string,.hljs-atelier-seaside-light .hljs-symbol,.hljs-atelier-seaside-light .hljs-bullet{color:#29a329}.hljs-atelier-seaside-light .hljs-title,.hljs-atelier-seaside-light .hljs-section{color:#3d62f5}.hljs-atelier-seaside-light .hljs-keyword,.hljs-atelier-seaside-light .hljs-selector-tag{color:#ad2bee}.hljs-atelier-seaside-light .hljs{display:block;overflow-x:auto;background:#f4fbf4;color:#5e6e5e;padding:.5em}.hljs-atelier-seaside-light .hljs-emphasis{font-style:italic}.hljs-atelier-seaside-light .hljs-strong{font-weight:bold}","atelier-sulphurpool-dark":".hljs-atelier-sulphurpool-dark .hljs-comment,.hljs-atelier-sulphurpool-dark .hljs-quote{color:#898ea4}.hljs-atelier-sulphurpool-dark .hljs-variable,.hljs-atelier-sulphurpool-dark .hljs-template-variable,.hljs-atelier-sulphurpool-dark .hljs-attribute,.hljs-atelier-sulphurpool-dark .hljs-tag,.hljs-atelier-sulphurpool-dark .hljs-name,.hljs-atelier-sulphurpool-dark .hljs-regexp,.hljs-atelier-sulphurpool-dark .hljs-link,.hljs-atelier-sulphurpool-dark .hljs-name,.hljs-atelier-sulphurpool-dark .hljs-selector-id,.hljs-atelier-sulphurpool-dark .hljs-selector-class{color:#c94922}.hljs-atelier-sulphurpool-dark .hljs-number,.hljs-atelier-sulphurpool-dark .hljs-meta,.hljs-atelier-sulphurpool-dark .hljs-built_in,.hljs-atelier-sulphurpool-dark .hljs-literal,.hljs-atelier-sulphurpool-dark .hljs-type,.hljs-atelier-sulphurpool-dark .hljs-params{color:#c76b29}.hljs-atelier-sulphurpool-dark .hljs-string,.hljs-atelier-sulphurpool-dark .hljs-symbol,.hljs-atelier-sulphurpool-dark .hljs-bullet{color:#ac9739}.hljs-atelier-sulphurpool-dark .hljs-title,.hljs-atelier-sulphurpool-dark .hljs-section{color:#3d8fd1}.hljs-atelier-sulphurpool-dark .hljs-keyword,.hljs-atelier-sulphurpool-dark .hljs-selector-tag{color:#6679cc}.hljs-atelier-sulphurpool-dark .hljs{display:block;overflow-x:auto;background:#202746;color:#979db4;padding:.5em}.hljs-atelier-sulphurpool-dark .hljs-emphasis{font-style:italic}.hljs-atelier-sulphurpool-dark .hljs-strong{font-weight:bold}","atelier-sulphurpool-light":".hljs-atelier-sulphurpool-light .hljs-comment,.hljs-atelier-sulphurpool-light .hljs-quote{color:#6b7394}.hljs-atelier-sulphurpool-light .hljs-variable,.hljs-atelier-sulphurpool-light .hljs-template-variable,.hljs-atelier-sulphurpool-light .hljs-attribute,.hljs-atelier-sulphurpool-light .hljs-tag,.hljs-atelier-sulphurpool-light .hljs-name,.hljs-atelier-sulphurpool-light .hljs-regexp,.hljs-atelier-sulphurpool-light .hljs-link,.hljs-atelier-sulphurpool-light .hljs-name,.hljs-atelier-sulphurpool-light .hljs-selector-id,.hljs-atelier-sulphurpool-light .hljs-selector-class{color:#c94922}.hljs-atelier-sulphurpool-light .hljs-number,.hljs-atelier-sulphurpool-light .hljs-meta,.hljs-atelier-sulphurpool-light .hljs-built_in,.hljs-atelier-sulphurpool-light .hljs-literal,.hljs-atelier-sulphurpool-light .hljs-type,.hljs-atelier-sulphurpool-light .hljs-params{color:#c76b29}.hljs-atelier-sulphurpool-light .hljs-string,.hljs-atelier-sulphurpool-light .hljs-symbol,.hljs-atelier-sulphurpool-light .hljs-bullet{color:#ac9739}.hljs-atelier-sulphurpool-light .hljs-title,.hljs-atelier-sulphurpool-light .hljs-section{color:#3d8fd1}.hljs-atelier-sulphurpool-light .hljs-keyword,.hljs-atelier-sulphurpool-light .hljs-selector-tag{color:#6679cc}.hljs-atelier-sulphurpool-light .hljs{display:block;overflow-x:auto;background:#f5f7ff;color:#5e6687;padding:.5em}.hljs-atelier-sulphurpool-light .hljs-emphasis{font-style:italic}.hljs-atelier-sulphurpool-light .hljs-strong{font-weight:bold}","brown-paper":".hljs-brown-paper .hljs{display:block;overflow-x:auto;padding:.5em;background:#b7a68e url(brown-papersq.png)}.hljs-brown-paper .hljs-keyword,.hljs-brown-paper .hljs-selector-tag,.hljs-brown-paper .hljs-literal{color:#005599;font-weight:bold}.hljs-brown-paper .hljs,.hljs-brown-paper .hljs-subst{color:#363c69}.hljs-brown-paper .hljs-string,.hljs-brown-paper .hljs-title,.hljs-brown-paper .hljs-section,.hljs-brown-paper .hljs-type,.hljs-brown-paper .hljs-attribute,.hljs-brown-paper .hljs-symbol,.hljs-brown-paper .hljs-bullet,.hljs-brown-paper .hljs-built_in,.hljs-brown-paper .hljs-addition,.hljs-brown-paper .hljs-variable,.hljs-brown-paper .hljs-template-tag,.hljs-brown-paper .hljs-template-variable,.hljs-brown-paper .hljs-link,.hljs-brown-paper .hljs-name{color:#2c009f}.hljs-brown-paper .hljs-comment,.hljs-brown-paper .hljs-quote,.hljs-brown-paper .hljs-meta,.hljs-brown-paper .hljs-deletion{color:#802022}.hljs-brown-paper .hljs-keyword,.hljs-brown-paper .hljs-selector-tag,.hljs-brown-paper .hljs-literal,.hljs-brown-paper .hljs-doctag,.hljs-brown-paper .hljs-title,.hljs-brown-paper .hljs-section,.hljs-brown-paper .hljs-type,.hljs-brown-paper .hljs-name,.hljs-brown-paper .hljs-strong{font-weight:bold}.hljs-brown-paper .hljs-emphasis{font-style:italic}","codepen-embed":".hljs-codepen-embed .hljs{display:block;overflow-x:auto;padding:.5em;background:#222;color:#fff}.hljs-codepen-embed .hljs-comment,.hljs-codepen-embed .hljs-quote{color:#777}.hljs-codepen-embed .hljs-variable,.hljs-codepen-embed .hljs-template-variable,.hljs-codepen-embed .hljs-tag,.hljs-codepen-embed .hljs-regexp,.hljs-codepen-embed .hljs-meta,.hljs-codepen-embed .hljs-number,.hljs-codepen-embed .hljs-built_in,.hljs-codepen-embed .hljs-literal,.hljs-codepen-embed .hljs-params,.hljs-codepen-embed .hljs-symbol,.hljs-codepen-embed .hljs-bullet,.hljs-codepen-embed .hljs-link,.hljs-codepen-embed .hljs-deletion{color:#ab875d}.hljs-codepen-embed .hljs-section,.hljs-codepen-embed .hljs-title,.hljs-codepen-embed .hljs-name,.hljs-codepen-embed .hljs-selector-id,.hljs-codepen-embed .hljs-selector-class,.hljs-codepen-embed .hljs-type,.hljs-codepen-embed .hljs-attribute{color:#9b869b}.hljs-codepen-embed .hljs-string,.hljs-codepen-embed .hljs-keyword,.hljs-codepen-embed .hljs-selector-tag,.hljs-codepen-embed .hljs-addition{color:#8f9c6c}.hljs-codepen-embed .hljs-emphasis{font-style:italic}.hljs-codepen-embed .hljs-strong{font-weight:bold}","color-brewer":".hljs-color-brewer .hljs{display:block;overflow-x:auto;padding:.5em;background:#fff}.hljs-color-brewer .hljs,.hljs-color-brewer .hljs-subst{color:#000}.hljs-color-brewer .hljs-string,.hljs-color-brewer .hljs-meta,.hljs-color-brewer .hljs-symbol,.hljs-color-brewer .hljs-template-tag,.hljs-color-brewer .hljs-template-variable,.hljs-color-brewer .hljs-addition{color:#756bb1}.hljs-color-brewer .hljs-comment,.hljs-color-brewer .hljs-quote{color:#636363}.hljs-color-brewer .hljs-number,.hljs-color-brewer .hljs-regexp,.hljs-color-brewer .hljs-literal,.hljs-color-brewer .hljs-bullet,.hljs-color-brewer .hljs-link{color:#31a354}.hljs-color-brewer .hljs-deletion,.hljs-color-brewer .hljs-variable{color:#88f}.hljs-color-brewer .hljs-keyword,.hljs-color-brewer .hljs-selector-tag,.hljs-color-brewer .hljs-title,.hljs-color-brewer .hljs-section,.hljs-color-brewer .hljs-built_in,.hljs-color-brewer .hljs-doctag,.hljs-color-brewer .hljs-type,.hljs-color-brewer .hljs-tag,.hljs-color-brewer .hljs-name,.hljs-color-brewer .hljs-selector-id,.hljs-color-brewer .hljs-selector-class,.hljs-color-brewer .hljs-strong{color:#3182bd}.hljs-color-brewer .hljs-emphasis{font-style:italic}.hljs-color-brewer .hljs-attribute{color:#e6550d}","dark":".hljs-dark .hljs{display:block;overflow-x:auto;padding:.5em;background:#444}.hljs-dark .hljs-keyword,.hljs-dark .hljs-selector-tag,.hljs-dark .hljs-literal,.hljs-dark .hljs-section,.hljs-dark .hljs-link{color:white}.hljs-dark .hljs,.hljs-dark .hljs-subst{color:#ddd}.hljs-dark .hljs-string,.hljs-dark .hljs-title,.hljs-dark .hljs-name,.hljs-dark .hljs-type,.hljs-dark .hljs-attribute,.hljs-dark .hljs-symbol,.hljs-dark .hljs-bullet,.hljs-dark .hljs-built_in,.hljs-dark .hljs-addition,.hljs-dark .hljs-variable,.hljs-dark .hljs-template-tag,.hljs-dark .hljs-template-variable{color:#d88}.hljs-dark .hljs-comment,.hljs-dark .hljs-quote,.hljs-dark .hljs-deletion,.hljs-dark .hljs-meta{color:#777}.hljs-dark .hljs-keyword,.hljs-dark .hljs-selector-tag,.hljs-dark .hljs-literal,.hljs-dark .hljs-title,.hljs-dark .hljs-section,.hljs-dark .hljs-doctag,.hljs-dark .hljs-type,.hljs-dark .hljs-name,.hljs-dark .hljs-strong{font-weight:bold}.hljs-dark .hljs-emphasis{font-style:italic}","darkula":".hljs-darkula .hljs{display:block;overflow-x:auto;padding:.5em;background:#2b2b2b}.hljs-darkula .hljs{color:#bababa}.hljs-darkula .hljs-strong,.hljs-darkula .hljs-emphasis{color:#a8a8a2}.hljs-darkula .hljs-bullet,.hljs-darkula .hljs-quote,.hljs-darkula .hljs-link,.hljs-darkula .hljs-number,.hljs-darkula .hljs-regexp,.hljs-darkula .hljs-literal{color:#6896ba}.hljs-darkula .hljs-code,.hljs-darkula .hljs-selector-class{color:#a6e22e}.hljs-darkula .hljs-emphasis{font-style:italic}.hljs-darkula .hljs-keyword,.hljs-darkula .hljs-selector-tag,.hljs-darkula .hljs-section,.hljs-darkula .hljs-attribute,.hljs-darkula .hljs-name,.hljs-darkula .hljs-variable{color:#cb7832}.hljs-darkula .hljs-params{color:#b9b9b9}.hljs-darkula .hljs-string,.hljs-darkula .hljs-subst,.hljs-darkula .hljs-type,.hljs-darkula .hljs-built_in,.hljs-darkula .hljs-symbol,.hljs-darkula .hljs-selector-id,.hljs-darkula .hljs-selector-attr,.hljs-darkula .hljs-template-tag,.hljs-darkula .hljs-template-variable,.hljs-darkula .hljs-addition{color:#e0c46c}.hljs-darkula .hljs-comment,.hljs-darkula .hljs-deletion,.hljs-darkula .hljs-meta{color:#7f7f7f}","default":".hljs-default .hljs{display:block;overflow-x:auto;padding:.5em;background:#f0f0f0}.hljs-default .hljs,.hljs-default .hljs-subst,.hljs-default .hljs-tag .hljs-title{color:black}.hljs-default .hljs-string,.hljs-default .hljs-title,.hljs-default .hljs-section,.hljs-default .hljs-attribute,.hljs-default .hljs-selector-id,.hljs-default .hljs-selector-class,.hljs-default .hljs-variable,.hljs-default .hljs-template-variable,.hljs-default .hljs-symbol,.hljs-default .hljs-deletion{color:#800}.hljs-default .hljs-comment,.hljs-default .hljs-quote{color:#888}.hljs-default .hljs-number,.hljs-default .hljs-regexp,.hljs-default .hljs-literal,.hljs-default .hljs-addition,.hljs-default .hljs-bullet,.hljs-default .hljs-link{color:#080}.hljs-default .hljs-meta{color:#88f}.hljs-default .hljs-keyword,.hljs-default .hljs-selector-tag,.hljs-default .hljs-title,.hljs-default .hljs-name,.hljs-default .hljs-section,.hljs-default .hljs-built_in,.hljs-default .hljs-doctag,.hljs-default .hljs-type,.hljs-default .hljs-strong{font-weight:bold}.hljs-default .hljs-emphasis{font-style:italic}","docco":".hljs-docco .hljs{display:block;overflow-x:auto;padding:.5em;color:#000;background:#f8f8ff}.hljs-docco .hljs-comment,.hljs-docco .hljs-quote{color:#408080;font-style:italic}.hljs-docco .hljs-keyword,.hljs-docco .hljs-selector-tag,.hljs-docco .hljs-literal,.hljs-docco .hljs-subst{color:#954121}.hljs-docco .hljs-number{color:#40a070}.hljs-docco .hljs-string,.hljs-docco .hljs-doctag{color:#219161}.hljs-docco .hljs-selector-id,.hljs-docco .hljs-selector-class,.hljs-docco .hljs-section,.hljs-docco .hljs-type{color:#19469d}.hljs-docco .hljs-params{color:#00f}.hljs-docco .hljs-title{color:#458;font-weight:bold}.hljs-docco .hljs-tag,.hljs-docco .hljs-name,.hljs-docco .hljs-attribute{color:#000080;font-weight:normal}.hljs-docco .hljs-variable,.hljs-docco .hljs-template-variable{color:#008080}.hljs-docco .hljs-regexp,.hljs-docco .hljs-link{color:#b68}.hljs-docco .hljs-symbol,.hljs-docco .hljs-bullet{color:#990073}.hljs-docco .hljs-built_in{color:#0086b3}.hljs-docco .hljs-meta{color:#999;font-weight:bold}.hljs-docco .hljs-deletion{background:#fdd}.hljs-docco .hljs-addition{background:#dfd}.hljs-docco .hljs-emphasis{font-style:italic}.hljs-docco .hljs-strong{font-weight:bold}","far":".hljs-far .hljs{display:block;overflow-x:auto;padding:.5em;background:#000080}.hljs-far .hljs,.hljs-far .hljs-subst{color:#0ff}.hljs-far .hljs-string,.hljs-far .hljs-attribute,.hljs-far .hljs-symbol,.hljs-far .hljs-bullet,.hljs-far .hljs-built_in,.hljs-far .hljs-template-tag,.hljs-far .hljs-template-variable,.hljs-far .hljs-addition{color:#ff0}.hljs-far .hljs-keyword,.hljs-far .hljs-selector-tag,.hljs-far .hljs-section,.hljs-far .hljs-type,.hljs-far .hljs-name,.hljs-far .hljs-selector-id,.hljs-far .hljs-selector-class,.hljs-far .hljs-variable{color:#fff}.hljs-far .hljs-comment,.hljs-far .hljs-quote,.hljs-far .hljs-doctag,.hljs-far .hljs-deletion{color:#888}.hljs-far .hljs-number,.hljs-far .hljs-regexp,.hljs-far .hljs-literal,.hljs-far .hljs-link{color:#0f0}.hljs-far .hljs-meta{color:#008080}.hljs-far .hljs-keyword,.hljs-far .hljs-selector-tag,.hljs-far .hljs-title,.hljs-far .hljs-section,.hljs-far .hljs-name,.hljs-far .hljs-strong{font-weight:bold}.hljs-far .hljs-emphasis{font-style:italic}","foundation":".hljs-foundation .hljs{display:block;overflow-x:auto;padding:.5em;background:#eee;color:black}.hljs-foundation .hljs-link,.hljs-foundation .hljs-emphasis,.hljs-foundation .hljs-attribute,.hljs-foundation .hljs-addition{color:#070}.hljs-foundation .hljs-emphasis{font-style:italic}.hljs-foundation .hljs-strong,.hljs-foundation .hljs-string,.hljs-foundation .hljs-deletion{color:#d14}.hljs-foundation .hljs-strong{font-weight:bold}.hljs-foundation .hljs-quote,.hljs-foundation .hljs-comment{color:#998;font-style:italic}.hljs-foundation .hljs-section,.hljs-foundation .hljs-title{color:#900}.hljs-foundation .hljs-class .hljs-title,.hljs-foundation .hljs-type{color:#458}.hljs-foundation .hljs-variable,.hljs-foundation .hljs-template-variable{color:#336699}.hljs-foundation .hljs-bullet{color:#997700}.hljs-foundation .hljs-meta{color:#3344bb}.hljs-foundation .hljs-code,.hljs-foundation .hljs-number,.hljs-foundation .hljs-literal,.hljs-foundation .hljs-keyword,.hljs-foundation .hljs-selector-tag{color:#099}.hljs-foundation .hljs-regexp{background-color:#fff0ff;color:#880088}.hljs-foundation .hljs-symbol{color:#990073}.hljs-foundation .hljs-tag,.hljs-foundation .hljs-name,.hljs-foundation .hljs-selector-id,.hljs-foundation .hljs-selector-class{color:#007700}","github-gist":".hljs-github-gist .hljs{display:block;background:white;padding:.5em;color:#333333;overflow-x:auto}.hljs-github-gist .hljs-comment,.hljs-github-gist .hljs-meta{color:#969896}.hljs-github-gist .hljs-string,.hljs-github-gist .hljs-variable,.hljs-github-gist .hljs-template-variable,.hljs-github-gist .hljs-strong,.hljs-github-gist .hljs-emphasis,.hljs-github-gist .hljs-quote{color:#df5000}.hljs-github-gist .hljs-keyword,.hljs-github-gist .hljs-selector-tag,.hljs-github-gist .hljs-type{color:#a71d5d}.hljs-github-gist .hljs-literal,.hljs-github-gist .hljs-symbol,.hljs-github-gist .hljs-bullet,.hljs-github-gist .hljs-attribute{color:#0086b3}.hljs-github-gist .hljs-section,.hljs-github-gist .hljs-name{color:#63a35c}.hljs-github-gist .hljs-tag{color:#333333}.hljs-github-gist .hljs-title,.hljs-github-gist .hljs-attr,.hljs-github-gist .hljs-selector-id,.hljs-github-gist .hljs-selector-class,.hljs-github-gist .hljs-selector-attr{color:#795da3}.hljs-github-gist .hljs-addition{color:#55a532;background-color:#eaffea}.hljs-github-gist .hljs-deletion{color:#bd2c00;background-color:#ffecec}.hljs-github-gist .hljs-link{text-decoration:underline}","github":".hljs-github .hljs{display:block;overflow-x:auto;padding:.5em;color:#333;background:#f8f8f8}.hljs-github .hljs-comment,.hljs-github .hljs-quote{color:#998;font-style:italic}.hljs-github .hljs-keyword,.hljs-github .hljs-selector-tag,.hljs-github .hljs-subst{color:#333;font-weight:bold}.hljs-github .hljs-number,.hljs-github .hljs-literal,.hljs-github .hljs-variable,.hljs-github .hljs-template-variable,.hljs-github .hljs-tag .hljs-attr{color:#008080}.hljs-github .hljs-string,.hljs-github .hljs-doctag{color:#d14}.hljs-github .hljs-title,.hljs-github .hljs-section,.hljs-github .hljs-selector-id{color:#900;font-weight:bold}.hljs-github .hljs-subst{font-weight:normal}.hljs-github .hljs-type,.hljs-github .hljs-class .hljs-title{color:#458;font-weight:bold}.hljs-github .hljs-tag,.hljs-github .hljs-name,.hljs-github .hljs-attribute{color:#000080;font-weight:normal}.hljs-github .hljs-regexp,.hljs-github .hljs-link{color:#009926}.hljs-github .hljs-symbol,.hljs-github .hljs-bullet{color:#990073}.hljs-github .hljs-built_in{color:#0086b3}.hljs-github .hljs-meta{color:#999;font-weight:bold}.hljs-github .hljs-deletion{background:#fdd}.hljs-github .hljs-addition{background:#dfd}.hljs-github .hljs-emphasis{font-style:italic}.hljs-github .hljs-strong{font-weight:bold}","googlecode":".hljs-googlecode .hljs{display:block;overflow-x:auto;padding:.5em;background:white;color:black}.hljs-googlecode .hljs-comment,.hljs-googlecode .hljs-quote{color:#800}.hljs-googlecode .hljs-keyword,.hljs-googlecode .hljs-selector-tag,.hljs-googlecode .hljs-section,.hljs-googlecode .hljs-title,.hljs-googlecode .hljs-name{color:#008}.hljs-googlecode .hljs-variable,.hljs-googlecode .hljs-template-variable{color:#660}.hljs-googlecode .hljs-string,.hljs-googlecode .hljs-selector-attr,.hljs-googlecode .hljs-regexp{color:#080}.hljs-googlecode .hljs-literal,.hljs-googlecode .hljs-symbol,.hljs-googlecode .hljs-bullet,.hljs-googlecode .hljs-meta,.hljs-googlecode .hljs-meta *,.hljs-googlecode .hljs-number,.hljs-googlecode .hljs-link{color:#066}.hljs-googlecode .hljs-title,.hljs-googlecode .hljs-doctag,.hljs-googlecode .hljs-type,.hljs-googlecode .hljs-attr,.hljs-googlecode .hljs-built_in,.hljs-googlecode .hljs-params{color:#606}.hljs-googlecode .hljs-attribute,.hljs-googlecode .hljs-subst{color:#000}.hljs-googlecode .hljs-formula{background-color:#eee;font-style:italic}.hljs-googlecode .hljs-selector-id,.hljs-googlecode .hljs-selector-class{color:#9B703F}.hljs-googlecode .hljs-addition{background-color:#baeeba}.hljs-googlecode .hljs-deletion{background-color:#ffc8bd}.hljs-googlecode .hljs-doctag,.hljs-googlecode .hljs-strong{font-weight:bold}.hljs-googlecode .hljs-emphasis{font-style:italic}","grayscale":".hljs-grayscale .hljs{display:block;overflow-x:auto;padding:.5em;color:#333;background:#fff}.hljs-grayscale .hljs-comment,.hljs-grayscale .hljs-quote{color:#777;font-style:italic}.hljs-grayscale .hljs-keyword,.hljs-grayscale .hljs-selector-tag,.hljs-grayscale .hljs-subst{color:#333;font-weight:bold}.hljs-grayscale .hljs-number,.hljs-grayscale .hljs-literal{color:#777}.hljs-grayscale .hljs-string,.hljs-grayscale .hljs-doctag,.hljs-grayscale .hljs-formula{color:#333;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAJ0lEQVQIW2O8e/fufwYGBgZBQUEQxcCIIfDu3Tuwivfv30NUoAsAALHpFMMLqZlPAAAAAElFTkSuQmCC) repeat}.hljs-grayscale .hljs-title,.hljs-grayscale .hljs-section,.hljs-grayscale .hljs-selector-id{color:#000;font-weight:bold}.hljs-grayscale .hljs-subst{font-weight:normal}.hljs-grayscale .hljs-class .hljs-title,.hljs-grayscale .hljs-type,.hljs-grayscale .hljs-name{color:#333;font-weight:bold}.hljs-grayscale .hljs-tag{color:#333}.hljs-grayscale .hljs-regexp{color:#333;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAICAYAAADA+m62AAAAPUlEQVQYV2NkQAN37979r6yszIgujiIAU4RNMVwhuiQ6H6wQl3XI4oy4FMHcCJPHcDS6J2A2EqUQpJhohQDexSef15DBCwAAAABJRU5ErkJggg==) repeat}.hljs-grayscale .hljs-symbol,.hljs-grayscale .hljs-bullet,.hljs-grayscale .hljs-link{color:#000;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAKElEQVQIW2NkQAO7d+/+z4gsBhJwdXVlhAvCBECKwIIwAbhKZBUwBQA6hBpm5efZsgAAAABJRU5ErkJggg==) repeat}.hljs-grayscale .hljs-built_in{color:#000;text-decoration:underline}.hljs-grayscale .hljs-meta{color:#999;font-weight:bold}.hljs-grayscale .hljs-deletion{color:#fff;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAYAAABS3WWCAAAAE0lEQVQIW2MMDQ39zzhz5kwIAQAyxweWgUHd1AAAAABJRU5ErkJggg==) repeat}.hljs-grayscale .hljs-addition{color:#000;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAALUlEQVQYV2N89+7dfwYk8P79ewZBQUFkIQZGOiu6e/cuiptQHAPl0NtNxAQBAM97Oejj3Dg7AAAAAElFTkSuQmCC) repeat}.hljs-grayscale .hljs-emphasis{font-style:italic}.hljs-grayscale .hljs-strong{font-weight:bold}","hopscotch":".hljs-hopscotch .hljs-comment,.hljs-hopscotch .hljs-quote{color:#989498}.hljs-hopscotch .hljs-variable,.hljs-hopscotch .hljs-template-variable,.hljs-hopscotch .hljs-attribute,.hljs-hopscotch .hljs-tag,.hljs-hopscotch .hljs-name,.hljs-hopscotch .hljs-selector-id,.hljs-hopscotch .hljs-selector-class,.hljs-hopscotch .hljs-regexp,.hljs-hopscotch .hljs-link,.hljs-hopscotch .hljs-deletion{color:#dd464c}.hljs-hopscotch .hljs-number,.hljs-hopscotch .hljs-built_in,.hljs-hopscotch .hljs-literal,.hljs-hopscotch .hljs-params{color:#fd8b19}.hljs-hopscotch .hljs-class .hljs-title{color:#fdcc59}.hljs-hopscotch .hljs-string,.hljs-hopscotch .hljs-symbol,.hljs-hopscotch .hljs-bullet,.hljs-hopscotch .hljs-addition{color:#8fc13e}.hljs-hopscotch .hljs-meta{color:#149b93}.hljs-hopscotch .hljs-function,.hljs-hopscotch .hljs-section,.hljs-hopscotch .hljs-title{color:#1290bf}.hljs-hopscotch .hljs-keyword,.hljs-hopscotch .hljs-selector-tag{color:#c85e7c}.hljs-hopscotch .hljs{display:block;background:#322931;color:#b9b5b8;padding:.5em}.hljs-hopscotch .hljs-emphasis{font-style:italic}.hljs-hopscotch .hljs-strong{font-weight:bold}","hybrid":".hljs-hybrid .hljs{display:block;overflow-x:auto;padding:.5em;background:#1d1f21}.hljs-hybrid .hljs::selection,.hljs-hybrid .hljs span::selection{background:#373b41}.hljs-hybrid .hljs::-moz-selection,.hljs-hybrid .hljs span::-moz-selection{background:#373b41}.hljs-hybrid .hljs{color:#c5c8c6}.hljs-hybrid .hljs-title,.hljs-hybrid .hljs-name{color:#f0c674}.hljs-hybrid .hljs-comment,.hljs-hybrid .hljs-meta,.hljs-hybrid .hljs-meta .hljs-keyword{color:#707880}.hljs-hybrid .hljs-number,.hljs-hybrid .hljs-symbol,.hljs-hybrid .hljs-literal,.hljs-hybrid .hljs-deletion,.hljs-hybrid .hljs-link{color:#cc6666}.hljs-hybrid .hljs-string,.hljs-hybrid .hljs-doctag,.hljs-hybrid .hljs-addition,.hljs-hybrid .hljs-regexp,.hljs-hybrid .hljs-selector-attr{color:#b5bd68}.hljs-hybrid .hljs-attribute,.hljs-hybrid .hljs-code,.hljs-hybrid .hljs-selector-id{color:#b294bb}.hljs-hybrid .hljs-keyword,.hljs-hybrid .hljs-selector-tag,.hljs-hybrid .hljs-bullet,.hljs-hybrid .hljs-tag{color:#81a2be}.hljs-hybrid .hljs-subst,.hljs-hybrid .hljs-variable,.hljs-hybrid .hljs-template-tag,.hljs-hybrid .hljs-template-variable{color:#8abeb7}.hljs-hybrid .hljs-type,.hljs-hybrid .hljs-built_in,.hljs-hybrid .hljs-quote,.hljs-hybrid .hljs-section,.hljs-hybrid .hljs-selector-class{color:#de935f}.hljs-hybrid .hljs-emphasis{font-style:italic}.hljs-hybrid .hljs-strong{font-weight:bold}","idea":".hljs-idea .hljs{display:block;overflow-x:auto;padding:.5em;color:#000;background:#fff}.hljs-idea .hljs-subst,.hljs-idea .hljs-title{font-weight:normal;color:#000}.hljs-idea .hljs-comment,.hljs-idea .hljs-quote{color:#808080;font-style:italic}.hljs-idea .hljs-meta{color:#808000}.hljs-idea .hljs-tag{background:#efefef}.hljs-idea .hljs-section,.hljs-idea .hljs-name,.hljs-idea .hljs-literal,.hljs-idea .hljs-keyword,.hljs-idea .hljs-selector-tag,.hljs-idea .hljs-type,.hljs-idea .hljs-selector-id,.hljs-idea .hljs-selector-class{font-weight:bold;color:#000080}.hljs-idea .hljs-attribute,.hljs-idea .hljs-number,.hljs-idea .hljs-regexp,.hljs-idea .hljs-link{font-weight:bold;color:#0000ff}.hljs-idea .hljs-number,.hljs-idea .hljs-regexp,.hljs-idea .hljs-link{font-weight:normal}.hljs-idea .hljs-string{color:#008000;font-weight:bold}.hljs-idea .hljs-symbol,.hljs-idea .hljs-bullet,.hljs-idea .hljs-formula{color:#000;background:#d0eded;font-style:italic}.hljs-idea .hljs-doctag{text-decoration:underline}.hljs-idea .hljs-variable,.hljs-idea .hljs-template-variable{color:#660e7a}.hljs-idea .hljs-addition{background:#baeeba}.hljs-idea .hljs-deletion{background:#ffc8bd}.hljs-idea .hljs-emphasis{font-style:italic}.hljs-idea .hljs-strong{font-weight:bold}","ir-black":".hljs-ir-black .hljs{display:block;overflow-x:auto;padding:.5em;background:#000;color:#f8f8f8}.hljs-ir-black .hljs-comment,.hljs-ir-black .hljs-quote,.hljs-ir-black .hljs-meta{color:#7c7c7c}.hljs-ir-black .hljs-keyword,.hljs-ir-black .hljs-selector-tag,.hljs-ir-black .hljs-tag,.hljs-ir-black .hljs-name{color:#96cbfe}.hljs-ir-black .hljs-attribute,.hljs-ir-black .hljs-selector-id{color:#ffffb6}.hljs-ir-black .hljs-string,.hljs-ir-black .hljs-selector-attr,.hljs-ir-black .hljs-addition{color:#a8ff60}.hljs-ir-black .hljs-subst{color:#daefa3}.hljs-ir-black .hljs-regexp,.hljs-ir-black .hljs-link{color:#e9c062}.hljs-ir-black .hljs-title,.hljs-ir-black .hljs-section,.hljs-ir-black .hljs-type,.hljs-ir-black .hljs-doctag{color:#ffffb6}.hljs-ir-black .hljs-symbol,.hljs-ir-black .hljs-bullet,.hljs-ir-black .hljs-variable,.hljs-ir-black .hljs-template-variable,.hljs-ir-black .hljs-literal{color:#c6c5fe}.hljs-ir-black .hljs-number,.hljs-ir-black .hljs-deletion{color:#ff73fd}.hljs-ir-black .hljs-emphasis{font-style:italic}.hljs-ir-black .hljs-strong{font-weight:bold}","kimbie.dark":".hljs-kimbie.dark .hljs-comment,.hljs-kimbie.dark .hljs-quote{color:#d6baad}.hljs-kimbie.dark .hljs-variable,.hljs-kimbie.dark .hljs-template-variable,.hljs-kimbie.dark .hljs-tag,.hljs-kimbie.dark .hljs-name,.hljs-kimbie.dark .hljs-selector-id,.hljs-kimbie.dark .hljs-selector-class,.hljs-kimbie.dark .hljs-regexp,.hljs-kimbie.dark .hljs-meta{color:#dc3958}.hljs-kimbie.dark .hljs-number,.hljs-kimbie.dark .hljs-built_in,.hljs-kimbie.dark .hljs-literal,.hljs-kimbie.dark .hljs-type,.hljs-kimbie.dark .hljs-params,.hljs-kimbie.dark .hljs-deletion,.hljs-kimbie.dark .hljs-link{color:#f79a32}.hljs-kimbie.dark .hljs-title,.hljs-kimbie.dark .hljs-section,.hljs-kimbie.dark .hljs-attribute{color:#f06431}.hljs-kimbie.dark .hljs-string,.hljs-kimbie.dark .hljs-symbol,.hljs-kimbie.dark .hljs-bullet,.hljs-kimbie.dark .hljs-addition{color:#889b4a}.hljs-kimbie.dark .hljs-keyword,.hljs-kimbie.dark .hljs-selector-tag,.hljs-kimbie.dark .hljs-function{color:#98676a}.hljs-kimbie.dark .hljs{display:block;overflow-x:auto;background:#221a0f;color:#d3af86;padding:.5em}.hljs-kimbie.dark .hljs-emphasis{font-style:italic}.hljs-kimbie.dark .hljs-strong{font-weight:bold}","kimbie.light":".hljs-kimbie.light .hljs-comment,.hljs-kimbie.light .hljs-quote{color:#a57a4c}.hljs-kimbie.light .hljs-variable,.hljs-kimbie.light .hljs-template-variable,.hljs-kimbie.light .hljs-tag,.hljs-kimbie.light .hljs-name,.hljs-kimbie.light .hljs-selector-id,.hljs-kimbie.light .hljs-selector-class,.hljs-kimbie.light .hljs-regexp,.hljs-kimbie.light .hljs-meta{color:#dc3958}.hljs-kimbie.light .hljs-number,.hljs-kimbie.light .hljs-built_in,.hljs-kimbie.light .hljs-literal,.hljs-kimbie.light .hljs-type,.hljs-kimbie.light .hljs-params,.hljs-kimbie.light .hljs-deletion,.hljs-kimbie.light .hljs-link{color:#f79a32}.hljs-kimbie.light .hljs-title,.hljs-kimbie.light .hljs-section,.hljs-kimbie.light .hljs-attribute{color:#f06431}.hljs-kimbie.light .hljs-string,.hljs-kimbie.light .hljs-symbol,.hljs-kimbie.light .hljs-bullet,.hljs-kimbie.light .hljs-addition{color:#889b4a}.hljs-kimbie.light .hljs-keyword,.hljs-kimbie.light .hljs-selector-tag,.hljs-kimbie.light .hljs-function{color:#98676a}.hljs-kimbie.light .hljs{display:block;overflow-x:auto;background:#fbebd4;color:#84613d;padding:.5em}.hljs-kimbie.light .hljs-emphasis{font-style:italic}.hljs-kimbie.light .hljs-strong{font-weight:bold}","magula":".hljs-magula .hljs{display:block;overflow-x:auto;padding:.5em;background-color:#f4f4f4}.hljs-magula .hljs,.hljs-magula .hljs-subst{color:black}.hljs-magula .hljs-string,.hljs-magula .hljs-title,.hljs-magula .hljs-symbol,.hljs-magula .hljs-bullet,.hljs-magula .hljs-attribute,.hljs-magula .hljs-addition,.hljs-magula .hljs-variable,.hljs-magula .hljs-template-tag,.hljs-magula .hljs-template-variable{color:#050}.hljs-magula .hljs-comment,.hljs-magula .hljs-quote{color:#777}.hljs-magula .hljs-number,.hljs-magula .hljs-regexp,.hljs-magula .hljs-literal,.hljs-magula .hljs-type,.hljs-magula .hljs-link{color:#800}.hljs-magula .hljs-deletion,.hljs-magula .hljs-meta{color:#00e}.hljs-magula .hljs-keyword,.hljs-magula .hljs-selector-tag,.hljs-magula .hljs-doctag,.hljs-magula .hljs-title,.hljs-magula .hljs-section,.hljs-magula .hljs-built_in,.hljs-magula .hljs-tag,.hljs-magula .hljs-name{font-weight:bold;color:navy}.hljs-magula .hljs-emphasis{font-style:italic}.hljs-magula .hljs-strong{font-weight:bold}","mono-blue":".hljs-mono-blue .hljs{display:block;overflow-x:auto;padding:.5em;background:#eaeef3}.hljs-mono-blue .hljs{color:#00193a}.hljs-mono-blue .hljs-keyword,.hljs-mono-blue .hljs-selector-tag,.hljs-mono-blue .hljs-title,.hljs-mono-blue .hljs-section,.hljs-mono-blue .hljs-doctag,.hljs-mono-blue .hljs-name,.hljs-mono-blue .hljs-strong{font-weight:bold}.hljs-mono-blue .hljs-comment{color:#738191}.hljs-mono-blue .hljs-string,.hljs-mono-blue .hljs-title,.hljs-mono-blue .hljs-section,.hljs-mono-blue .hljs-built_in,.hljs-mono-blue .hljs-literal,.hljs-mono-blue .hljs-type,.hljs-mono-blue .hljs-addition,.hljs-mono-blue .hljs-tag,.hljs-mono-blue .hljs-quote,.hljs-mono-blue .hljs-name,.hljs-mono-blue .hljs-selector-id,.hljs-mono-blue .hljs-selector-class{color:#0048ab}.hljs-mono-blue .hljs-meta,.hljs-mono-blue .hljs-subst,.hljs-mono-blue .hljs-symbol,.hljs-mono-blue .hljs-regexp,.hljs-mono-blue .hljs-attribute,.hljs-mono-blue .hljs-deletion,.hljs-mono-blue .hljs-variable,.hljs-mono-blue .hljs-template-variable,.hljs-mono-blue .hljs-link,.hljs-mono-blue .hljs-bullet{color:#4c81c9}.hljs-mono-blue .hljs-emphasis{font-style:italic}","monokai-sublime":".hljs-monokai-sublime .hljs{display:block;overflow-x:auto;padding:.5em;background:#23241f}.hljs-monokai-sublime .hljs,.hljs-monokai-sublime .hljs-tag,.hljs-monokai-sublime .hljs-subst{color:#f8f8f2}.hljs-monokai-sublime .hljs-strong,.hljs-monokai-sublime .hljs-emphasis{color:#a8a8a2}.hljs-monokai-sublime .hljs-bullet,.hljs-monokai-sublime .hljs-quote,.hljs-monokai-sublime .hljs-number,.hljs-monokai-sublime .hljs-regexp,.hljs-monokai-sublime .hljs-literal,.hljs-monokai-sublime .hljs-link{color:#ae81ff}.hljs-monokai-sublime .hljs-code,.hljs-monokai-sublime .hljs-title,.hljs-monokai-sublime .hljs-section,.hljs-monokai-sublime .hljs-selector-class{color:#a6e22e}.hljs-monokai-sublime .hljs-strong{font-weight:bold}.hljs-monokai-sublime .hljs-emphasis{font-style:italic}.hljs-monokai-sublime .hljs-keyword,.hljs-monokai-sublime .hljs-selector-tag,.hljs-monokai-sublime .hljs-name,.hljs-monokai-sublime .hljs-attr{color:#f92672}.hljs-monokai-sublime .hljs-symbol,.hljs-monokai-sublime .hljs-attribute{color:#66d9ef}.hljs-monokai-sublime .hljs-params,.hljs-monokai-sublime .hljs-class .hljs-title{color:#f8f8f2}.hljs-monokai-sublime .hljs-string,.hljs-monokai-sublime .hljs-type,.hljs-monokai-sublime .hljs-built_in,.hljs-monokai-sublime .hljs-selector-id,.hljs-monokai-sublime .hljs-selector-attr,.hljs-monokai-sublime .hljs-addition,.hljs-monokai-sublime .hljs-variable,.hljs-monokai-sublime .hljs-template-variable{color:#e6db74}.hljs-monokai-sublime .hljs-comment,.hljs-monokai-sublime .hljs-deletion,.hljs-monokai-sublime .hljs-meta{color:#75715e}","monokai":".hljs-monokai .hljs{display:block;overflow-x:auto;padding:.5em;background:#272822;color:#ddd}.hljs-monokai .hljs-tag,.hljs-monokai .hljs-keyword,.hljs-monokai .hljs-selector-tag,.hljs-monokai .hljs-literal,.hljs-monokai .hljs-strong,.hljs-monokai .hljs-name{color:#f92672}.hljs-monokai .hljs-code{color:#66d9ef}.hljs-monokai .hljs-class .hljs-title{color:white}.hljs-monokai .hljs-attribute,.hljs-monokai .hljs-symbol,.hljs-monokai .hljs-regexp,.hljs-monokai .hljs-link{color:#bf79db}.hljs-monokai .hljs-string,.hljs-monokai .hljs-bullet,.hljs-monokai .hljs-subst,.hljs-monokai .hljs-title,.hljs-monokai .hljs-section,.hljs-monokai .hljs-emphasis,.hljs-monokai .hljs-type,.hljs-monokai .hljs-built_in,.hljs-monokai .hljs-selector-attr,.hljs-monokai .hljs-addition,.hljs-monokai .hljs-variable,.hljs-monokai .hljs-template-tag,.hljs-monokai .hljs-template-variable{color:#a6e22e}.hljs-monokai .hljs-comment,.hljs-monokai .hljs-quote,.hljs-monokai .hljs-deletion,.hljs-monokai .hljs-meta{color:#75715e}.hljs-monokai .hljs-keyword,.hljs-monokai .hljs-selector-tag,.hljs-monokai .hljs-literal,.hljs-monokai .hljs-doctag,.hljs-monokai .hljs-title,.hljs-monokai .hljs-section,.hljs-monokai .hljs-type,.hljs-monokai .hljs-selector-id{font-weight:bold}","obsidian":".hljs-obsidian .hljs{display:block;overflow-x:auto;padding:.5em;background:#282b2e}.hljs-obsidian .hljs-keyword,.hljs-obsidian .hljs-selector-tag,.hljs-obsidian .hljs-literal,.hljs-obsidian .hljs-selector-id{color:#93c763}.hljs-obsidian .hljs-number{color:#ffcd22}.hljs-obsidian .hljs{color:#e0e2e4}.hljs-obsidian .hljs-attribute{color:#668bb0}.hljs-obsidian .hljs-code,.hljs-obsidian .hljs-class .hljs-title,.hljs-obsidian .hljs-section{color:white}.hljs-obsidian .hljs-regexp,.hljs-obsidian .hljs-link{color:#d39745}.hljs-obsidian .hljs-meta{color:#557182}.hljs-obsidian .hljs-tag,.hljs-obsidian .hljs-name,.hljs-obsidian .hljs-bullet,.hljs-obsidian .hljs-subst,.hljs-obsidian .hljs-emphasis,.hljs-obsidian .hljs-type,.hljs-obsidian .hljs-built_in,.hljs-obsidian .hljs-selector-attr,.hljs-obsidian .hljs-addition,.hljs-obsidian .hljs-variable,.hljs-obsidian .hljs-template-tag,.hljs-obsidian .hljs-template-variable{color:#8cbbad}.hljs-obsidian .hljs-string,.hljs-obsidian .hljs-symbol{color:#ec7600}.hljs-obsidian .hljs-comment,.hljs-obsidian .hljs-quote,.hljs-obsidian .hljs-deletion{color:#818e96}.hljs-obsidian .hljs-selector-class{color:#A082BD}.hljs-obsidian .hljs-keyword,.hljs-obsidian .hljs-selector-tag,.hljs-obsidian .hljs-literal,.hljs-obsidian .hljs-doctag,.hljs-obsidian .hljs-title,.hljs-obsidian .hljs-section,.hljs-obsidian .hljs-type,.hljs-obsidian .hljs-name,.hljs-obsidian .hljs-strong{font-weight:bold}","paraiso-dark":".hljs-paraiso-dark .hljs-comment,.hljs-paraiso-dark .hljs-quote{color:#8d8687}.hljs-paraiso-dark .hljs-variable,.hljs-paraiso-dark .hljs-template-variable,.hljs-paraiso-dark .hljs-tag,.hljs-paraiso-dark .hljs-name,.hljs-paraiso-dark .hljs-selector-id,.hljs-paraiso-dark .hljs-selector-class,.hljs-paraiso-dark .hljs-regexp,.hljs-paraiso-dark .hljs-link,.hljs-paraiso-dark .hljs-meta{color:#ef6155}.hljs-paraiso-dark .hljs-number,.hljs-paraiso-dark .hljs-built_in,.hljs-paraiso-dark .hljs-literal,.hljs-paraiso-dark .hljs-type,.hljs-paraiso-dark .hljs-params,.hljs-paraiso-dark .hljs-deletion{color:#f99b15}.hljs-paraiso-dark .hljs-title,.hljs-paraiso-dark .hljs-section,.hljs-paraiso-dark .hljs-attribute{color:#fec418}.hljs-paraiso-dark .hljs-string,.hljs-paraiso-dark .hljs-symbol,.hljs-paraiso-dark .hljs-bullet,.hljs-paraiso-dark .hljs-addition{color:#48b685}.hljs-paraiso-dark .hljs-keyword,.hljs-paraiso-dark .hljs-selector-tag{color:#815ba4}.hljs-paraiso-dark .hljs{display:block;overflow-x:auto;background:#2f1e2e;color:#a39e9b;padding:.5em}.hljs-paraiso-dark .hljs-emphasis{font-style:italic}.hljs-paraiso-dark .hljs-strong{font-weight:bold}","paraiso-light":".hljs-paraiso-light .hljs-comment,.hljs-paraiso-light .hljs-quote{color:#776e71}.hljs-paraiso-light .hljs-variable,.hljs-paraiso-light .hljs-template-variable,.hljs-paraiso-light .hljs-tag,.hljs-paraiso-light .hljs-name,.hljs-paraiso-light .hljs-selector-id,.hljs-paraiso-light .hljs-selector-class,.hljs-paraiso-light .hljs-regexp,.hljs-paraiso-light .hljs-link,.hljs-paraiso-light .hljs-meta{color:#ef6155}.hljs-paraiso-light .hljs-number,.hljs-paraiso-light .hljs-built_in,.hljs-paraiso-light .hljs-literal,.hljs-paraiso-light .hljs-type,.hljs-paraiso-light .hljs-params,.hljs-paraiso-light .hljs-deletion{color:#f99b15}.hljs-paraiso-light .hljs-title,.hljs-paraiso-light .hljs-section,.hljs-paraiso-light .hljs-attribute{color:#fec418}.hljs-paraiso-light .hljs-string,.hljs-paraiso-light .hljs-symbol,.hljs-paraiso-light .hljs-bullet,.hljs-paraiso-light .hljs-addition{color:#48b685}.hljs-paraiso-light .hljs-keyword,.hljs-paraiso-light .hljs-selector-tag{color:#815ba4}.hljs-paraiso-light .hljs{display:block;overflow-x:auto;background:#e7e9db;color:#4f424c;padding:.5em}.hljs-paraiso-light .hljs-emphasis{font-style:italic}.hljs-paraiso-light .hljs-strong{font-weight:bold}","railscasts":".hljs-railscasts .hljs{display:block;overflow-x:auto;padding:.5em;background:#232323;color:#e6e1dc}.hljs-railscasts .hljs-comment,.hljs-railscasts .hljs-quote{color:#bc9458;font-style:italic}.hljs-railscasts .hljs-keyword,.hljs-railscasts .hljs-selector-tag{color:#c26230}.hljs-railscasts .hljs-string,.hljs-railscasts .hljs-number,.hljs-railscasts .hljs-regexp,.hljs-railscasts .hljs-variable,.hljs-railscasts .hljs-template-variable{color:#a5c261}.hljs-railscasts .hljs-subst{color:#519f50}.hljs-railscasts .hljs-tag,.hljs-railscasts .hljs-name{color:#e8bf6a}.hljs-railscasts .hljs-type{color:#da4939}.hljs-railscasts .hljs-symbol,.hljs-railscasts .hljs-bullet,.hljs-railscasts .hljs-built_in,.hljs-railscasts .hljs-attr,.hljs-railscasts .hljs-link{color:#6d9cbe}.hljs-railscasts .hljs-params{color:#d0d0ff}.hljs-railscasts .hljs-attribute{color:#cda869}.hljs-railscasts .hljs-meta,.hljs-railscasts .hljs-meta *{color:#9b859d}.hljs-railscasts .hljs-title,.hljs-railscasts .hljs-section{color:#ffc66d}.hljs-railscasts .hljs-addition{background-color:#144212;color:#e6e1dc;display:inline-block;width:100%}.hljs-railscasts .hljs-deletion{background-color:#600;color:#e6e1dc;display:inline-block;width:100%}.hljs-railscasts .hljs-selector-class{color:#9b703f}.hljs-railscasts .hljs-selector-id{color:#8b98ab}.hljs-railscasts .hljs-emphasis{font-style:italic}.hljs-railscasts .hljs-strong{font-weight:bold}.hljs-railscasts .hljs-link{text-decoration:underline}","rainbow":".hljs-rainbow .hljs{display:block;overflow-x:auto;padding:.5em;background:#474949;color:#d1d9e1}.hljs-rainbow .hljs-comment,.hljs-rainbow .hljs-quote{color:#969896;font-style:italic}.hljs-rainbow .hljs-keyword,.hljs-rainbow .hljs-selector-tag,.hljs-rainbow .hljs-literal,.hljs-rainbow .hljs-type,.hljs-rainbow .hljs-addition{color:#cc99cc}.hljs-rainbow .hljs-number,.hljs-rainbow .hljs-selector-attr{color:#f99157}.hljs-rainbow .hljs-string,.hljs-rainbow .hljs-doctag,.hljs-rainbow .hljs-regexp{color:#8abeb7}.hljs-rainbow .hljs-title,.hljs-rainbow .hljs-name,.hljs-rainbow .hljs-section,.hljs-rainbow .hljs-built_in{color:#b5bd68}.hljs-rainbow .hljs-variable,.hljs-rainbow .hljs-template-variable,.hljs-rainbow .hljs-selector-id,.hljs-rainbow .hljs-class .hljs-title{color:#ffcc66}.hljs-rainbow .hljs-section,.hljs-rainbow .hljs-name,.hljs-rainbow .hljs-strong{font-weight:bold}.hljs-rainbow .hljs-symbol,.hljs-rainbow .hljs-bullet,.hljs-rainbow .hljs-subst,.hljs-rainbow .hljs-meta,.hljs-rainbow .hljs-link{color:#f99157}.hljs-rainbow .hljs-deletion{color:#dc322f}.hljs-rainbow .hljs-formula{background:#eee8d5}.hljs-rainbow .hljs-attr,.hljs-rainbow .hljs-attribute{color:#81a2be}.hljs-rainbow .hljs-emphasis{font-style:italic}","school-book":".hljs-school-book .hljs{display:block;overflow-x:auto;padding:15px .5em .5em 30px;font-size:11px;line-height:16px}.hljs-school-book pre{background:#f6f6ae url(school-book.png);border-top:solid 2px #d2e8b9;border-bottom:solid 1px #d2e8b9}.hljs-school-book .hljs-keyword,.hljs-school-book .hljs-selector-tag,.hljs-school-book .hljs-literal{color:#005599;font-weight:bold}.hljs-school-book .hljs,.hljs-school-book .hljs-subst{color:#3e5915}.hljs-school-book .hljs-string,.hljs-school-book .hljs-title,.hljs-school-book .hljs-section,.hljs-school-book .hljs-type,.hljs-school-book .hljs-symbol,.hljs-school-book .hljs-bullet,.hljs-school-book .hljs-attribute,.hljs-school-book .hljs-built_in,.hljs-school-book .hljs-addition,.hljs-school-book .hljs-variable,.hljs-school-book .hljs-template-tag,.hljs-school-book .hljs-template-variable,.hljs-school-book .hljs-link{color:#2c009f}.hljs-school-book .hljs-comment,.hljs-school-book .hljs-quote,.hljs-school-book .hljs-deletion,.hljs-school-book .hljs-meta{color:#e60415}.hljs-school-book .hljs-keyword,.hljs-school-book .hljs-selector-tag,.hljs-school-book .hljs-literal,.hljs-school-book .hljs-doctag,.hljs-school-book .hljs-title,.hljs-school-book .hljs-section,.hljs-school-book .hljs-type,.hljs-school-book .hljs-name,.hljs-school-book .hljs-selector-id,.hljs-school-book .hljs-strong{font-weight:bold}.hljs-school-book .hljs-emphasis{font-style:italic}","solarized-dark":".hljs-solarized-dark .hljs{display:block;overflow-x:auto;padding:.5em;background:#002b36;color:#839496}.hljs-solarized-dark .hljs-comment,.hljs-solarized-dark .hljs-quote{color:#586e75}.hljs-solarized-dark .hljs-keyword,.hljs-solarized-dark .hljs-selector-tag,.hljs-solarized-dark .hljs-literal,.hljs-solarized-dark .hljs-addition{color:#859900}.hljs-solarized-dark .hljs-number,.hljs-solarized-dark .hljs-string,.hljs-solarized-dark .hljs-doctag,.hljs-solarized-dark .hljs-regexp{color:#2aa198}.hljs-solarized-dark .hljs-title,.hljs-solarized-dark .hljs-section,.hljs-solarized-dark .hljs-built_in,.hljs-solarized-dark .hljs-name,.hljs-solarized-dark .hljs-selector-id,.hljs-solarized-dark .hljs-selector-class{color:#268bd2}.hljs-solarized-dark .hljs-attribute,.hljs-solarized-dark .hljs-attr,.hljs-solarized-dark .hljs-variable,.hljs-solarized-dark .hljs-template-variable,.hljs-solarized-dark .hljs-class .hljs-title,.hljs-solarized-dark .hljs-type{color:#b58900}.hljs-solarized-dark .hljs-symbol,.hljs-solarized-dark .hljs-bullet,.hljs-solarized-dark .hljs-subst,.hljs-solarized-dark .hljs-meta .hljs-keyword,.hljs-solarized-dark .hljs-selector-attr,.hljs-solarized-dark .hljs-link{color:#cb4b16}.hljs-solarized-dark .hljs-deletion{color:#dc322f}.hljs-solarized-dark .hljs-formula{background:#073642}.hljs-solarized-dark .hljs-emphasis{font-style:italic}.hljs-solarized-dark .hljs-strong{font-weight:bold}","solarized-light":".hljs-solarized-light .hljs{display:block;overflow-x:auto;padding:.5em;background:#fdf6e3;color:#657b83}.hljs-solarized-light .hljs-comment,.hljs-solarized-light .hljs-quote{color:#93a1a1}.hljs-solarized-light .hljs-keyword,.hljs-solarized-light .hljs-selector-tag,.hljs-solarized-light .hljs-literal,.hljs-solarized-light .hljs-addition{color:#859900}.hljs-solarized-light .hljs-number,.hljs-solarized-light .hljs-string,.hljs-solarized-light .hljs-doctag,.hljs-solarized-light .hljs-regexp{color:#2aa198}.hljs-solarized-light .hljs-title,.hljs-solarized-light .hljs-section,.hljs-solarized-light .hljs-built_in,.hljs-solarized-light .hljs-name,.hljs-solarized-light .hljs-selector-id,.hljs-solarized-light .hljs-selector-class{color:#268bd2}.hljs-solarized-light .hljs-attribute,.hljs-solarized-light .hljs-attr,.hljs-solarized-light .hljs-variable,.hljs-solarized-light .hljs-template-variable,.hljs-solarized-light .hljs-class .hljs-title,.hljs-solarized-light .hljs-type{color:#b58900}.hljs-solarized-light .hljs-symbol,.hljs-solarized-light .hljs-bullet,.hljs-solarized-light .hljs-subst,.hljs-solarized-light .hljs-meta .hljs-keyword,.hljs-solarized-light .hljs-selector-attr,.hljs-solarized-light .hljs-link{color:#cb4b16}.hljs-solarized-light .hljs-deletion{color:#dc322f}.hljs-solarized-light .hljs-formula{background:#eee8d5}.hljs-solarized-light .hljs-emphasis{font-style:italic}.hljs-solarized-light .hljs-strong{font-weight:bold}","sunburst":".hljs-sunburst .hljs{display:block;overflow-x:auto;padding:.5em;background:#000;color:#f8f8f8}.hljs-sunburst .hljs-comment,.hljs-sunburst .hljs-quote{color:#aeaeae;font-style:italic}.hljs-sunburst .hljs-keyword,.hljs-sunburst .hljs-selector-tag,.hljs-sunburst .hljs-type{color:#e28964}.hljs-sunburst .hljs-string{color:#65b042}.hljs-sunburst .hljs-subst{color:#daefa3}.hljs-sunburst .hljs-regexp,.hljs-sunburst .hljs-link{color:#e9c062}.hljs-sunburst .hljs-title,.hljs-sunburst .hljs-section,.hljs-sunburst .hljs-tag,.hljs-sunburst .hljs-name{color:#89bdff}.hljs-sunburst .hljs-class .hljs-title,.hljs-sunburst .hljs-doctag{text-decoration:underline}.hljs-sunburst .hljs-symbol,.hljs-sunburst .hljs-bullet,.hljs-sunburst .hljs-number{color:#3387cc}.hljs-sunburst .hljs-params,.hljs-sunburst .hljs-variable,.hljs-sunburst .hljs-template-variable{color:#3e87e3}.hljs-sunburst .hljs-attribute{color:#cda869}.hljs-sunburst .hljs-meta{color:#8996a8}.hljs-sunburst .hljs-formula{background-color:#0e2231;color:#f8f8f8;font-style:italic}.hljs-sunburst .hljs-addition{background-color:#253b22;color:#f8f8f8}.hljs-sunburst .hljs-deletion{background-color:#420e09;color:#f8f8f8}.hljs-sunburst .hljs-selector-class{color:#9b703f}.hljs-sunburst .hljs-selector-id{color:#8b98ab}.hljs-sunburst .hljs-emphasis{font-style:italic}.hljs-sunburst .hljs-strong{font-weight:bold}","tomorrow-night-blue":".hljs-tomorrow-night-blue .hljs-comment,.hljs-tomorrow-night-blue .hljs-quote{color:#7285b7}.hljs-tomorrow-night-blue .hljs-variable,.hljs-tomorrow-night-blue .hljs-template-variable,.hljs-tomorrow-night-blue .hljs-tag,.hljs-tomorrow-night-blue .hljs-name,.hljs-tomorrow-night-blue .hljs-selector-id,.hljs-tomorrow-night-blue .hljs-selector-class,.hljs-tomorrow-night-blue .hljs-regexp,.hljs-tomorrow-night-blue .hljs-deletion{color:#ff9da4}.hljs-tomorrow-night-blue .hljs-number,.hljs-tomorrow-night-blue .hljs-built_in,.hljs-tomorrow-night-blue .hljs-literal,.hljs-tomorrow-night-blue .hljs-type,.hljs-tomorrow-night-blue .hljs-params,.hljs-tomorrow-night-blue .hljs-meta,.hljs-tomorrow-night-blue .hljs-link{color:#ffc58f}.hljs-tomorrow-night-blue .hljs-attribute{color:#ffeead}.hljs-tomorrow-night-blue .hljs-string,.hljs-tomorrow-night-blue .hljs-symbol,.hljs-tomorrow-night-blue .hljs-bullet,.hljs-tomorrow-night-blue .hljs-addition{color:#d1f1a9}.hljs-tomorrow-night-blue .hljs-title,.hljs-tomorrow-night-blue .hljs-section{color:#bbdaff}.hljs-tomorrow-night-blue .hljs-keyword,.hljs-tomorrow-night-blue .hljs-selector-tag{color:#ebbbff}.hljs-tomorrow-night-blue .hljs{display:block;overflow-x:auto;background:#002451;color:white;padding:.5em}.hljs-tomorrow-night-blue .hljs-emphasis{font-style:italic}.hljs-tomorrow-night-blue .hljs-strong{font-weight:bold}","tomorrow-night-bright":".hljs-tomorrow-night-bright .hljs-comment,.hljs-tomorrow-night-bright .hljs-quote{color:#969896}.hljs-tomorrow-night-bright .hljs-variable,.hljs-tomorrow-night-bright .hljs-template-variable,.hljs-tomorrow-night-bright .hljs-tag,.hljs-tomorrow-night-bright .hljs-name,.hljs-tomorrow-night-bright .hljs-selector-id,.hljs-tomorrow-night-bright .hljs-selector-class,.hljs-tomorrow-night-bright .hljs-regexp,.hljs-tomorrow-night-bright .hljs-deletion{color:#d54e53}.hljs-tomorrow-night-bright .hljs-number,.hljs-tomorrow-night-bright .hljs-built_in,.hljs-tomorrow-night-bright .hljs-literal,.hljs-tomorrow-night-bright .hljs-type,.hljs-tomorrow-night-bright .hljs-params,.hljs-tomorrow-night-bright .hljs-meta,.hljs-tomorrow-night-bright .hljs-link{color:#e78c45}.hljs-tomorrow-night-bright .hljs-attribute{color:#e7c547}.hljs-tomorrow-night-bright .hljs-string,.hljs-tomorrow-night-bright .hljs-symbol,.hljs-tomorrow-night-bright .hljs-bullet,.hljs-tomorrow-night-bright .hljs-addition{color:#b9ca4a}.hljs-tomorrow-night-bright .hljs-title,.hljs-tomorrow-night-bright .hljs-section{color:#7aa6da}.hljs-tomorrow-night-bright .hljs-keyword,.hljs-tomorrow-night-bright .hljs-selector-tag{color:#c397d8}.hljs-tomorrow-night-bright .hljs{display:block;overflow-x:auto;background:black;color:#eaeaea;padding:.5em}.hljs-tomorrow-night-bright .hljs-emphasis{font-style:italic}.hljs-tomorrow-night-bright .hljs-strong{font-weight:bold}","tomorrow-night-eighties":".hljs-tomorrow-night-eighties .hljs-comment,.hljs-tomorrow-night-eighties .hljs-quote{color:#999999}.hljs-tomorrow-night-eighties .hljs-variable,.hljs-tomorrow-night-eighties .hljs-template-variable,.hljs-tomorrow-night-eighties .hljs-tag,.hljs-tomorrow-night-eighties .hljs-name,.hljs-tomorrow-night-eighties .hljs-selector-id,.hljs-tomorrow-night-eighties .hljs-selector-class,.hljs-tomorrow-night-eighties .hljs-regexp,.hljs-tomorrow-night-eighties .hljs-deletion{color:#f2777a}.hljs-tomorrow-night-eighties .hljs-number,.hljs-tomorrow-night-eighties .hljs-built_in,.hljs-tomorrow-night-eighties .hljs-literal,.hljs-tomorrow-night-eighties .hljs-type,.hljs-tomorrow-night-eighties .hljs-params,.hljs-tomorrow-night-eighties .hljs-meta,.hljs-tomorrow-night-eighties .hljs-link{color:#f99157}.hljs-tomorrow-night-eighties .hljs-attribute{color:#ffcc66}.hljs-tomorrow-night-eighties .hljs-string,.hljs-tomorrow-night-eighties .hljs-symbol,.hljs-tomorrow-night-eighties .hljs-bullet,.hljs-tomorrow-night-eighties .hljs-addition{color:#99cc99}.hljs-tomorrow-night-eighties .hljs-title,.hljs-tomorrow-night-eighties .hljs-section{color:#6699cc}.hljs-tomorrow-night-eighties .hljs-keyword,.hljs-tomorrow-night-eighties .hljs-selector-tag{color:#cc99cc}.hljs-tomorrow-night-eighties .hljs{display:block;overflow-x:auto;background:#2d2d2d;color:#cccccc;padding:.5em}.hljs-tomorrow-night-eighties .hljs-emphasis{font-style:italic}.hljs-tomorrow-night-eighties .hljs-strong{font-weight:bold}","tomorrow-night":".hljs-tomorrow-night .hljs-comment,.hljs-tomorrow-night .hljs-quote{color:#969896}.hljs-tomorrow-night .hljs-variable,.hljs-tomorrow-night .hljs-template-variable,.hljs-tomorrow-night .hljs-tag,.hljs-tomorrow-night .hljs-name,.hljs-tomorrow-night .hljs-selector-id,.hljs-tomorrow-night .hljs-selector-class,.hljs-tomorrow-night .hljs-regexp,.hljs-tomorrow-night .hljs-deletion{color:#cc6666}.hljs-tomorrow-night .hljs-number,.hljs-tomorrow-night .hljs-built_in,.hljs-tomorrow-night .hljs-literal,.hljs-tomorrow-night .hljs-type,.hljs-tomorrow-night .hljs-params,.hljs-tomorrow-night .hljs-meta,.hljs-tomorrow-night .hljs-link{color:#de935f}.hljs-tomorrow-night .hljs-attribute{color:#f0c674}.hljs-tomorrow-night .hljs-string,.hljs-tomorrow-night .hljs-symbol,.hljs-tomorrow-night .hljs-bullet,.hljs-tomorrow-night .hljs-addition{color:#b5bd68}.hljs-tomorrow-night .hljs-title,.hljs-tomorrow-night .hljs-section{color:#81a2be}.hljs-tomorrow-night .hljs-keyword,.hljs-tomorrow-night .hljs-selector-tag{color:#b294bb}.hljs-tomorrow-night .hljs{display:block;overflow-x:auto;background:#1d1f21;color:#c5c8c6;padding:.5em}.hljs-tomorrow-night .hljs-emphasis{font-style:italic}.hljs-tomorrow-night .hljs-strong{font-weight:bold}","tomorrow":".hljs-tomorrow .hljs-comment,.hljs-tomorrow .hljs-quote{color:#8e908c}.hljs-tomorrow .hljs-variable,.hljs-tomorrow .hljs-template-variable,.hljs-tomorrow .hljs-tag,.hljs-tomorrow .hljs-name,.hljs-tomorrow .hljs-selector-id,.hljs-tomorrow .hljs-selector-class,.hljs-tomorrow .hljs-regexp,.hljs-tomorrow .hljs-deletion{color:#c82829}.hljs-tomorrow .hljs-number,.hljs-tomorrow .hljs-built_in,.hljs-tomorrow .hljs-literal,.hljs-tomorrow .hljs-type,.hljs-tomorrow .hljs-params,.hljs-tomorrow .hljs-meta,.hljs-tomorrow .hljs-link{color:#f5871f}.hljs-tomorrow .hljs-attribute{color:#eab700}.hljs-tomorrow .hljs-string,.hljs-tomorrow .hljs-symbol,.hljs-tomorrow .hljs-bullet,.hljs-tomorrow .hljs-addition{color:#718c00}.hljs-tomorrow .hljs-title,.hljs-tomorrow .hljs-section{color:#4271ae}.hljs-tomorrow .hljs-keyword,.hljs-tomorrow .hljs-selector-tag{color:#8959a8}.hljs-tomorrow .hljs{display:block;overflow-x:auto;background:white;color:#4d4d4c;padding:.5em}.hljs-tomorrow .hljs-emphasis{font-style:italic}.hljs-tomorrow .hljs-strong{font-weight:bold}","vs":".hljs-vs .hljs{display:block;overflow-x:auto;padding:.5em;background:white;color:black}.hljs-vs .hljs-comment,.hljs-vs .hljs-quote,.hljs-vs .hljs-variable{color:#008000}.hljs-vs .hljs-keyword,.hljs-vs .hljs-selector-tag,.hljs-vs .hljs-built_in,.hljs-vs .hljs-name,.hljs-vs .hljs-tag{color:#00f}.hljs-vs .hljs-string,.hljs-vs .hljs-title,.hljs-vs .hljs-section,.hljs-vs .hljs-attribute,.hljs-vs .hljs-literal,.hljs-vs .hljs-template-tag,.hljs-vs .hljs-template-variable,.hljs-vs .hljs-addition{color:#a31515}.hljs-vs .hljs-deletion,.hljs-vs .hljs-selector-attr,.hljs-vs .hljs-meta{color:#2b91af}.hljs-vs .hljs-doctag{color:#808080}.hljs-vs .hljs-attr{color:#f00}.hljs-vs .hljs-symbol,.hljs-vs .hljs-bullet,.hljs-vs .hljs-link{color:#00b0e8}.hljs-vs .hljs-emphasis{font-style:italic}.hljs-vs .hljs-strong{font-weight:bold}","xcode":".hljs-xcode .hljs{display:block;overflow-x:auto;padding:.5em;background:#fff;color:black}.hljs-xcode .hljs-comment,.hljs-xcode .hljs-quote{color:#006a00}.hljs-xcode .hljs-keyword,.hljs-xcode .hljs-selector-tag,.hljs-xcode .hljs-literal{color:#aa0d91}.hljs-xcode .hljs-name{color:#008}.hljs-xcode .hljs-variable,.hljs-xcode .hljs-template-variable{color:#660}.hljs-xcode .hljs-string{color:#c41a16}.hljs-xcode .hljs-regexp,.hljs-xcode .hljs-link{color:#080}.hljs-xcode .hljs-title,.hljs-xcode .hljs-tag,.hljs-xcode .hljs-symbol,.hljs-xcode .hljs-bullet,.hljs-xcode .hljs-number,.hljs-xcode .hljs-meta,.hljs-xcode .hljs-meta *{color:#1c00cf}.hljs-xcode .hljs-section,.hljs-xcode .hljs-class .hljs-title,.hljs-xcode .hljs-type,.hljs-xcode .hljs-attr,.hljs-xcode .hljs-built_in,.hljs-xcode .hljs-params{color:#5c2699}.hljs-xcode .hljs-attribute,.hljs-xcode .hljs-subst{color:#000}.hljs-xcode .hljs-formula{background-color:#eee;font-style:italic}.hljs-xcode .hljs-addition{background-color:#baeeba}.hljs-xcode .hljs-deletion{background-color:#ffc8bd}.hljs-xcode .hljs-selector-id,.hljs-xcode .hljs-selector-class{color:#9b703f}.hljs-xcode .hljs-doctag,.hljs-xcode .hljs-strong{font-weight:bold}.hljs-xcode .hljs-emphasis{font-style:italic}","zenburn":".hljs-zenburn .hljs{display:block;overflow-x:auto;padding:.5em;background:#3f3f3f;color:#dcdcdc}.hljs-zenburn .hljs-keyword,.hljs-zenburn .hljs-selector-tag,.hljs-zenburn .hljs-tag{color:#e3ceab}.hljs-zenburn .hljs-template-tag{color:#dcdcdc}.hljs-zenburn .hljs-number{color:#8cd0d3}.hljs-zenburn .hljs-variable,.hljs-zenburn .hljs-template-variable,.hljs-zenburn .hljs-attribute{color:#efdcbc}.hljs-zenburn .hljs-literal{color:#efefaf}.hljs-zenburn .hljs-subst{color:#8f8f8f}.hljs-zenburn .hljs-title,.hljs-zenburn .hljs-name,.hljs-zenburn .hljs-selector-id,.hljs-zenburn .hljs-selector-class,.hljs-zenburn .hljs-section,.hljs-zenburn .hljs-type{color:#efef8f}.hljs-zenburn .hljs-symbol,.hljs-zenburn .hljs-bullet,.hljs-zenburn .hljs-link{color:#dca3a3}.hljs-zenburn .hljs-deletion,.hljs-zenburn .hljs-string,.hljs-zenburn .hljs-built_in{color:#cc9393}.hljs-zenburn .hljs-addition,.hljs-zenburn .hljs-comment,.hljs-zenburn .hljs-quote,.hljs-zenburn .hljs-meta{color:#7f9f7f}.hljs-zenburn .hljs-emphasis{font-style:italic}.hljs-zenburn .hljs-strong{font-weight:bold}"},
  engine: hljs
};
