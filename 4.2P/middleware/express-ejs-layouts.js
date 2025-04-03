/**
 * Simple Express middleware for using layouts with EJS
 */
module.exports = function(options) {
  const defaultOptions = {
    layout: 'layout',
    root: 'views'
  };
  
  const opts = Object.assign({}, defaultOptions, options || {});
  
  return function(req, res, next) {
    // Override the default render method
    const originalRender = res.render;
    
    res.render = function(view, locals, callback) {
      // Define locals if not provided
      locals = locals || {};
      
      // Call the original render with the layout as the view
      originalRender.call(this, view, locals, function(err, html) {
        if (err) return callback ? callback(err) : next(err);
        
        // Update the rendered HTML to be placed in the {body} placeholder of the layout
        locals.body = html;
        
        // Render the layout 
        originalRender.call(res, opts.layout, locals, callback);
      });
    };
    
    next();
  };
}; 