<?php
class TM_AjaxPro_Block_Form_Login extends Mage_Customer_Block_Form_Login
{
    protected function _prepareLayout()
    {
        return $this;

//        $this->getLayout()->getBlock('head')->setTitle(Mage::helper('customer')->__('Customer Login'));
//        return parent::_prepareLayout();
    }
}