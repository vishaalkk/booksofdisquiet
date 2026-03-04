module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("style.css");
    eleventyConfig.addPassthroughCopy("script.js");
    eleventyConfig.addPassthroughCopy("CNAME");
    return {
        dir: {
            input: ".",
            output: "_site"
        }
    };
};
