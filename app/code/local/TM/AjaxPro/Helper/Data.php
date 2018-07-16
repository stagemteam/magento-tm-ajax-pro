<?php
/* <!-- AjaxPro --> */
class TM_AjaxPro_Helper_Data extends Mage_Core_Helper_Abstract
{
    const XML_PATH_CATALOG_PRODUCT_VIEW_ENABLED = 'ajax_pro/catalogProductView/enabled';

    public function prepareLayoutForListBlock(Mage_Catalog_Block_Product_Abstract $block)
    {
        if (!Mage::getStoreConfigFlag(self::XML_PATH_CATALOG_PRODUCT_VIEW_ENABLED)) {
            return $block;
        }
        /* @var $blockHead TM_AjaxPro_Block_Head */
        $blockHead = $block->getLayout()->getBlock('ajaxpro.head');
        if (!$blockHead) {
            return $block;
        }
        // tm_ajaxpro_catalog_product_view handle
        $blockHead->addItem('js', 'varien/product.js')
            ->addItem('skin_js', 'js/bundle.js')
            ->addItem('js_css', 'calendar/calendar-win2k-1.css', 'media="all"')
            ->addItem('js', 'calendar/calendar.js')
            ->addItem('js', 'calendar/calendar-setup.js')
        ;
        if (version_compare(Mage::getVersion(), '1.9.3.0') >= 0) {
            $blockHead->addItem('js', 'varien/product_options.js'); // mage 1.9.3 integration
        }

        return $block;
    }

    /**
     * Retrieve url for add product to cart
     * Will return product view page URL if product has required options
     *
     * @param Mage_Catalog_Block_Product_Abstract $block
     * @param Mage_Catalog_Model_Product $product
     * @param array $additional
     * @return string
     */
    public function getAddToCartUrl(Mage_Catalog_Block_Product_Abstract $block, $product, $additional = array())
    {
        if (!Mage::getStoreConfig('ajax_pro/general/enabled')
            || !Mage::getStoreConfig('ajax_pro/catalogProductView/enabled')
            || TM_AjaxPro_Model_UserAgent::isSearchBot()
            || (TM_AjaxPro_Model_UserAgent::isMobile()
                    && Mage::getStoreConfig('ajax_pro/general/disabledOnMobileDevice'))
            ) {
            return $block->getParentAddToCartUrl($product, $additional);
        }

        if (Mage::helper('core')->isModuleOutputEnabled('Sitewards_B2BProfessional')) {
            if (!Mage::helper('sitewards_b2bprofessional')->isProductActive($product)) {
                return $block->getParentAddToCartUrl($product, $additional);
            }
        }

        if (defined('Mage_Core_Model_Url::FORM_KEY')) {
            $formKey = Mage::getSingleton('core/session')->getFormKey();
            if (!empty($formKey)) {
                $additional[Mage_Core_Model_Url::FORM_KEY] = $formKey;
            }
        }

        $typeInstance = $product->getTypeInstance(true);
        $productTypeId = $product->getTypeId();

        if (Mage_Downloadable_Model_Product_Type::TYPE_DOWNLOADABLE == $productTypeId
            && !$typeInstance->getProduct($product)->getLinksPurchasedSeparately()
        ) {
            $_product = $product->load($product->getId());

            $_options = $typeInstance->getProduct($_product)->getOptions();
            if (0 == count($_options)) {
                return Mage::helper('checkout/cart')->getAddUrl($product, $additional);
            }
        }

        if ($typeInstance->hasRequiredOptions($product)
            || $typeInstance->hasOptions($product)
            || Mage_Catalog_Model_Product_Type_Grouped::TYPE_CODE === $productTypeId
        ) {
            if (!isset($additional['_escape'])) {
                $additional['_escape'] = true;
            }
            if (!isset($additional['_query'])) {
                $additional['_query'] = array();
            }
            $additional['_query']['options'] = 'cart';

            $_url = $product->getUrl();
            $product->setUrl(null);
            $product->setData('request_path', null);
            $url = $block->getProductUrl($product, $additional);
            $product->setUrl($_url);
            return $url;
        }

        return $block->getParentAddToCartUrl($product, $additional);
    }
}
