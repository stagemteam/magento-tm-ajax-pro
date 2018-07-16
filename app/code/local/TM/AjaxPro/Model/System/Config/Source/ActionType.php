<?php
/*AjaxPro*/
class TM_AjaxPro_Model_System_Config_Source_ActionType
{
    public function toOptionArray()
    {
        return array(
            array('value'=>'button', 'label'=>Mage::helper('ajaxpro')->__('button')),
            array('value'=>'scroll', 'label'=>Mage::helper('ajaxpro')->__('scroll'))
        );
    }
}