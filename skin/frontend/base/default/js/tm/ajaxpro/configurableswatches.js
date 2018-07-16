// configurable swatches integration
document.observe("dom:loaded", function () {
    if ('undefined' == typeof $j && jQuery) {
        $j = jQuery.noConflict();
    }
    if ('undefined' !== typeof ProductMediaManager) {
        ProductMediaManager.createZoom = ProductMediaManager.createZoom.wrap(function(original, image) {
            original(image);

            var img = $j('.ajaxpro-form .product-image img');
            if (!img.length) {
                return;
            }

            // prevent image size increasing
            if (!img.hasClass('resized') && img.height()) {
                img.addClass('resized')
                    .css({
                        'max-height': img.height()
                    });
            }

            var srcset = img.attr('srcset'),
                newSrc = image.attr('src');
            img.attr('src', newSrc);

            if (srcset) {
                if (image.attr('srcset')) {
                    img.attr('srcset', image.attr('srcset'));
                } else {
                    img.removeAttr('srcset');
                }
            }
        });
        ProductMediaManager.swapImage = ProductMediaManager.swapImage.wrap(function(original, targetImage) {
            original(targetImage);

            var imageGallery = $j('.ajaxpro-form .product-img-box');
            if (!imageGallery.length) {
                return;
            }

            // targetImage = $j(targetImage);
            // targetImage.addClass('gallery-image');

            if (targetImage[0].complete) {
                // ProductMediaManager.createZoom(targetImage);
            } else {
                imageGallery.addClass('loading');
                imagesLoaded(targetImage, function() {
                    imageGallery.removeClass('loading');
                    // ProductMediaManager.createZoom(targetImage);
                });
            }
        });
    }
});
