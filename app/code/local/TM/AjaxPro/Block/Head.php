<?php
class TM_AjaxPro_Block_Head extends TM_AjaxPro_Block_Template
{
    /**
     * Add HEAD Item
     *
     * Allowed types:
     *  - js
     *  - js_css
     *  - skin_js
     *  - skin_css
     *  - rss
     *
     * @param string $type
     * @param string $name
     * @param string $params
     * @param string $if
     * @param string $cond
     * @return \TM_AjaxPro_Block_Js
     */
    public function addItem($type, $name, $params=null, $if=null, $cond=null)
    {
        if ($this->_isValid() && $head = $this->getLayout()->getBlock('head')) {

            $head->addItem($type, $name, $params, $if, $cond);
        }

        return $this;
    }
}