<?php

class TM_AjaxPro_Model_System_Config_Source_MessageHandle
{
   /**
    * Options getter
    *
    * @return array
    */
    public function toOptionArray()
    {
        $object = new Varien_Object(array(
            'options' => array(
                array(
                    'value' => 'tm_ajaxpro_checkout_cart_add_simple',
                    'label' => Mage::helper('ajaxpro')->__('Simple')
                ),
                array(
                    'value' => 'tm_ajaxpro_checkout_cart_add_with_crosssell',
                    'label' => Mage::helper('ajaxpro')->__('Crosssell')
                ),
                array(
                    'value' => 'tm_ajaxpro_checkout_cart_add_with_cart',
                    'label' => Mage::helper('ajaxpro')->__('Shopping Cart')
                ),
                array(
                    'value' => 'tm_ajaxpro_checkout_cart_add_with_cart_extended',
                    'label' => Mage::helper('ajaxpro')->__('Extended Shopping Cart')
                )
            )
        ));
        Mage::dispatchEvent('ajaxpro_message_handle_options_load', array('object' => $object));
        return $object->getOptions();
    }
}
