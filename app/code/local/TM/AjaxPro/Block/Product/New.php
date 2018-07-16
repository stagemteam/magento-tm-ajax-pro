<?php

class TM_AjaxPro_Block_Product_New extends Mage_Catalog_Block_Product_New
{
    protected function _prepareLayout()
    {
        parent::_prepareLayout();
        return Mage::helper('ajaxpro')->prepareLayoutForListBlock($this);
    }

    public function getCurrentUrl()
    {
        return Mage::getUrl('*/*/*', array('_current' => true, '_use_rewrite' => true));
    }

    protected function _getRequest()
    {
        if (!$this->_request) {
            $this->_request = Mage::app()->getRequest();
        }
        return $this->_request;
    }

    /**
     * Retrieve url for add product to cart
     * Will return product view page URL if product has required options
     *
     * @param Mage_Catalog_Model_Product $product
     * @param array $additional
     * @return string
     */
    public function getAddToCartUrl($product, $additional = array())
    {
        return Mage::helper('ajaxpro')->getAddToCartUrl($this, $product, $additional);
    }

    /**
     * Retrieve url for add product to cart
     * Will return product view page URL if product has required options
     *
     * @param Mage_Catalog_Model_Product $product
     * @param array $additional
     * @return string
     */
    public function getParentAddToCartUrl($product, $additional = array())
    {
        return parent::getAddToCartUrl($product, $additional);
    }
}
