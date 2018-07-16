<?php
class TM_AjaxPro_Block_Template extends Mage_Core_Block_Text_List
{
    protected $_validators = array();

    /**
     *
     * @param string $path
     * @return \TM_AjaxPro_Block_Js
     */
    public function addStoreConfigValidator($path, $not = false)
    {
        $this->_validators[] = array(
            'type' => 'store_config',
            'path' => 'ajax_pro/' . $path,
            'not'  => (bool)$not
        );
        return $this;
    }

    public function addModelMethodValidator($model, $method, $callType = '', $not = false)
    {
        $this->_validators[] = array(
            'type'   => 'model' . $callType,
            'model'  => $model,
            'method' => $method,
            'not'    => (bool)$not
        );
        return $this;
    }

    protected function __isValid()
    {
        if (!Mage::getStoreConfig('ajax_pro/general/enabled')) {
            return false;
        }

        if (TM_AjaxPro_Model_UserAgent::isSearchBot()) {
            return false;
        }

        if (TM_AjaxPro_Model_UserAgent::isMobile()
            && Mage::getStoreConfig('ajax_pro/general/disabledOnMobileDevice')) {

            return false;
        }

        return true;
    }

    protected function _isValid()
    {
        if (null == $this->getValid()) {
            $this->setValid($this->__isValid());
        }

        $collection = $this->_validators;
        $this->_validators = array();

        if (false == $this->getValid()) {
            return false;
        }

        foreach ($collection as $item) {
            switch ($item['type']) {
                case 'store_config':
                    $_status = (bool) Mage::getStoreConfig($item['path']);
                    break;
                case 'model':
                    $model = Mage::getModel($item['model']);
                    $_status = (bool) call_user_func(
                        array($model, $item['method'])
                    );
                    break;
                case 'modelstatic':
                    $_status = (bool) call_user_func(
                        $item['model'] . '::' . $item['method']
                    );
                    break;
                default:
                    $_status = false;
                    break;
            }
            if ($item['not']) {
                $_status = !$_status;
            }

            if (!$_status) {
                return false;
            }
        }
        return true;
    }

    public function _toHtml()
    {
        if (!$this->_isValid()) {
            return '';
        }
        return parent::_toHtml();
    }
}
