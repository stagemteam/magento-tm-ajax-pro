<?php
class TM_QtySwitcher_Model_Adminhtml_System_Config_Source_Inputtype
{
    public function toOptionArray()
    {
        return array(
            array('value' => 'text', 'label' => Mage::helper('tm_qtyswitcher')->__('Text Field')),
            array('value' => 'select', 'label' => Mage::helper('tm_qtyswitcher')->__('Dropdown'))
        );
    }
}
