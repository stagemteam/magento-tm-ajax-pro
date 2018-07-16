<?php
/*AjaxPro*/
class TM_AjaxPro_Model_System_Config_Source_Location
{
    public function toOptionArray()
    {
        return array(
            array('value'=>'center', 'label'=>Mage::helper('ajaxpro')->__('center')),
            array('value'=>'top', 'label'=>Mage::helper('ajaxpro')->__('top')),
            array('value'=>'bottom', 'label'=>Mage::helper('ajaxpro')->__('bottom'))
        );
    }
}