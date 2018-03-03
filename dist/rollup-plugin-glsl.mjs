import { createFilter } from 'rollup-pluginutils';
import MagicString from 'magic-string';

function compressShader(source) {
  var needNewline = false;
  return source.replace(/\/\*.*?\*\//g, "").split(/\n+/).reduce(function (result, line) {
    line = line.trim().replace(/\s{2,}|\t/, " ");
    if (line[0] === '#') {
      if (needNewline) {
        result.push("\n");
      }

      result.push(line, "\n");
      needNewline = false
    } else {
      result.push(line
        .replace(/\/\/.*/, "")
        .replace(/\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g, "$1"))
      needNewline = true;
    }
    return result;
  }, []).join('').replace(/\n+/g, "\n");
}

function generateCode(source) {
	return ("export default " + (JSON.stringify(source)) + ";");
}

function glsl(options) {
	if ( options === void 0 ) options = {};

	var filter = createFilter(options.include, options.exclude);

	return {
		name: 'glsl',

		transform: function transform(source, id) {
			if (!filter(id)) return;

			var code = generateCode(compressShader(source)),
			      magicString = new MagicString(code);

			var result = { code: magicString.toString() };
      if (options.sourceMap !== false) {
        result.map = magicString.generateMap({ hires: true })
      }
      return result
		}
	};
}

export default glsl;