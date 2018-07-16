<?php
class TM_QtySwitcher_Helper_Data extends Mage_Core_Helper_Abstract
{
    const SECTION = 'tm_qtyswitcher';
    const ENABLE = 'tm_qtyswitcher/main/enabled';

    /**
     *
     * @return json string | false
     */
    public function getJsonConfig()
    {
        $enable = (bool) Mage::getStoreConfig(self::ENABLE);
        if (!$enable) {
            return false;
        }
        $config = Mage::getStoreConfig(self::SECTION);
        $config =  $config ? $config : array();

        $product = Mage::registry('current_product');
        if (!$product) {
            $config = Mage::helper('core')->jsonEncode($config);
            return $config;
        }

        $stockItem = $product->getStockItem();
        $isManageStock = (bool) $stockItem->getManageStock();
        $max = $stockItem->getMaxSaleQty();
        if ($isManageStock && 'configurable' !== $stockItem->getTypeId()) {
            $_max = (float) $stockItem->getQty();
            if ($max > $_max) {
                $max = $_max;
            }
        }
        $step = $stockItem->getQtyIncrements() ? $stockItem->getQtyIncrements() : 1;

        $min = (float) $stockItem->getMinSaleQty();
        $max = $max ? $max : 1000000;
        if ($max < $min) {
            $max = 10000;
        }

        $config['current_product']  = array(
            'id' => $product->getId(),
            'min' => $min,
            'max' => $max,
            'step' => $step
        );
        $config = Mage::helper('core')->jsonEncode($config);
        return $config;
    }

    public function getJsInit()
    {
        $config = $this->getJsonConfig();

        if (Mage::app()->getRequest()->isXmlHttpRequest()) {
            return;
        }

        if (false === $config) {
            return;
        }

        return '<div id="tm-qty-switcher-config" data-config=\'' . $config . '\'></div>';
    }
}
