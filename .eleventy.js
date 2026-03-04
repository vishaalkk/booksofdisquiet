module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("script.js");
    return {
        dir: {
            input: ".",
            output: "_site"
        }
    };
};
