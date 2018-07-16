<?php

class TM_AjaxPro_Model_Layout {

    /**
     *
     * @var array
     */
    protected $_blockNamesToRender = array();

    /**
     *
     * @var Mage_Core_Controller_Varien_Action
     */
    protected $_controllerAction;

    /**
     *
     * @param Mage_Core_Controller_Varien_Action $controllerAction
     * @return \TM_AjaxPro_Model_Layout
     */
    public function setControllerAction(Mage_Core_Controller_Varien_Action $controllerAction)
    {
        $this->_controllerAction = $controllerAction;
        return $this;
    }

    /**
     *
     * @return Mage_Core_Model_Layout
     */
    public function getLayout()
    {
        return $this->_controllerAction->getLayout();
    }

    /**
     *
     * @return \TM_AjaxPro_Model_Layout
     */
    public function loadLayout($handles, $blockNames)
    {
        $handlesToUnset = array('firecheckout_replace_checkout_links');
        foreach ($handlesToUnset as $_handle) {
            if (($key = array_search($_handle, $handles)) !== false) {
                unset($handles[$key]);
            }
        }
        $this->_controllerAction->loadLayout($handles, false);
        $layout = $this->getLayout();
        $messageBlock = $layout->getBlock('messages');
        if (!$messageBlock) {
            $messageBlock = $layout->createBlock('core/messages', 'messages');
        }

        $this->_initLayoutMessagesBlock($messageBlock);
        $layout->setBlock('messages', $messageBlock);
//        if ($this->_initLayoutMessagesBlock($messageBlock)) {
//            $layout->setBlock('messages', $messageBlock);
//        } else {
//            if (($key = array_search('ajaxpro_message', $blockNames)) !== false) {
//                unset($blockNames[$key]);
//            }
//        }
        $this->_blockNamesToRender = $blockNames;

        // $this->deleteRemoveInstructions();
//        echo ($layout->getUpdate()->asSimplexml()->asXML());
//        die;
        $this->generateBlocks();

        return $this;
    }
//
    protected function _initLayoutMessagesBlock(Mage_Core_Block_Messages $block)
    {
        $storageNames = array(
//            'core/session',
            'checkout/session',
            'wishlist/session',
            'customer/session',
            'catalog/session'
        );
        $flushMessages = Mage::getStoreConfigFlag('ajax_pro/checkoutCart/enabledForm');
        foreach ($storageNames as $storageName) {
            $storage = Mage::getSingleton($storageName);
            if ($storage) {
                $block->addMessages($storage->getMessages($flushMessages));
                $block->setEscapeMessageFlag($storage->getEscapeMessages($flushMessages));
                $block->addStorageType($storage);
            }
        }
        $collection = $block->getMessageCollection();

        $errorStatus = !$collection->count(Mage_Core_Model_Message::ERROR);
        $warningStatus = !$collection->count(Mage_Core_Model_Message::WARNING);
        $noticeStatus = !$collection->count(Mage_Core_Model_Message::NOTICE);

        $status = $errorStatus
            && $warningStatus
            // && $noticeStatus
        ;

        $block
            ->setErrorStatus($errorStatus)
            ->setWarningStatus($warningStatus)
            ->setNoticeStatus($noticeStatus)
            ->setStatus($status)
        ;
//        if (0 == $collection->count()) {
//            $block->addSuccess(
//                Mage::app()->getTranslator()->translate(array(
//                    'Action was complete',
//                    'TM_AjaxPro'
//                ))
//            );
//        }
        return $collection->count() > 0;
    }

    public function renderLayout()
    {
        $data = $_layout = array();
        foreach ($this->_blockNamesToRender as $blockName) {
            $block = $this->getBlock($blockName);
            if ($block) {
                $_html = $block->toHtml();
                // encoding fix
                if (function_exists('mb_convert_encoding')) {
                    $_layout[$blockName] = mb_convert_encoding(
                        $_html,
                        "HTML-ENTITIES",
                        "UTF-8"
                    );
                } else {
                    $_layout[$blockName] = $_html;
                }
            }
        }
        if (!empty($_layout)) {
            $data['layout'] = $_layout;
        }

        return $data;
    }

    /**
     * Copy of Mage_Core_Model_Layout::_generateBlock
     *
     * @param Varien_Simplexml_Element $node
     * @param Varien_Simplexml_Element $parent
     * @return Mage_Core_Model_Layout
     */
    protected function _generateBlock($node, $parent)
    {
        if (!empty($node['class'])) {
            $className = (string)$node['class'];
        } else {
            $className = (string)$node['type'];
        }

        $blockName = (string)$node['name'];
        $_profilerKey = 'BLOCK: '.$blockName;
        Varien_Profiler::start($_profilerKey);

        // diff
        if (!empty($node['parent'])) {
            $parentBlock = $this->getBlock((string)$node['parent']);
        } else {
            $parentName = $parent->getBlockName();
            if (!empty($parentName)) {
                $parentBlock = $this->getBlock($parentName);
            }
        }

        if (empty($parentBlock)
            && !in_array($blockName, $this->_blockNamesToRender)) {

            return $this;
        }
        // end

        $block = $this->addBlock($className, $blockName);

        if (!$block) {
            return $this;
        }
        // code was moved on line 126-133
        if (!empty($parentBlock)) {
            $alias = isset($node['as']) ? (string)$node['as'] : '';
            if (isset($node['before'])) {
                $sibling = (string)$node['before'];
                if ('-'===$sibling) {
                    $sibling = '';
                }
                $parentBlock->insert($block, $sibling, false, $alias);
            } elseif (isset($node['after'])) {
                $sibling = (string)$node['after'];
                if ('-'===$sibling) {
                    $sibling = '';
                }
                $parentBlock->insert($block, $sibling, true, $alias);
            } else {
                $parentBlock->append($block, $alias);
            }
        }
        if (!empty($node['template'])) {
            $block->setTemplate((string)$node['template']);
        }

        if (!empty($node['output'])) {
            $method = (string)$node['output'];
            $this->addOutputBlock($blockName, $method);
        }
        Varien_Profiler::stop($_profilerKey);

        return $this;
    }

    public function getNode($path=null)
    {
        return $this->getLayout()->getNode($path);
    }

    public function getBlock($name)
    {
        return $this->getLayout()->getBlock($name);
    }

    public function addBlock($block, $blockName)
    {
        return $this->getLayout()->addBlock($block, $blockName);
    }

    public function addOutputBlock($blockName, $method = 'toHtml')
    {
        return $this->getLayout()->addOutputBlock($blockName, $method);
    }

    /**
     * Copy of Mage_Core_Model_Layout::generateBlocks
     *
     * @param Mage_Core_Layout_Element|null $parent
     */
    public function generateBlocks($parent=null)
    {
        if (empty($parent)) {
            $parent = $this->getNode();
        }
        foreach ($parent as $node) {
            $attributes = $node->attributes();
            if ((bool)$attributes->ignore
                // core/text_list containers should be processed because of possible needed children
                && 'core/text_list' !== (string)$attributes->type) {

                continue;
            }
            switch ($node->getName()) {
                case 'block':
                    $this->_generateBlock($node, $parent);
                    $this->generateBlocks($node);
                    break;

                case 'reference':
                    $this->generateBlocks($node);
                    break;

                case 'action':
                    $this->_generateAction($node, $parent);
                    break;
            }
        }
    }

    /**
     * Enter description here...
     *
     * @param Varien_Simplexml_Element $node
     * @param Varien_Simplexml_Element $parent
     * @return Mage_Core_Model_Layout
     */
    protected function _generateAction($node, $parent)
    {
        if (isset($node['ifconfig']) && ($configPath = (string)$node['ifconfig'])) {
            if (!Mage::getStoreConfigFlag($configPath)) {
                return $this;
            }
        }

        $method = (string)$node['method'];
        if (!empty($node['block'])) {
            $parentName = (string)$node['block'];
        } else {
            $parentName = $parent->getBlockName();
        }

        $_profilerKey = 'BLOCK ACTION: '.$parentName.' -> '.$method;
        Varien_Profiler::start($_profilerKey);

        if (!empty($parentName)) {
            $block = $this->getBlock($parentName);
        }
        if (!empty($block)) {

            $args = (array)$node->children();
            unset($args['@attributes']);

            foreach ($args as $key => $arg) {
                if (($arg instanceof Mage_Core_Model_Layout_Element)) {
                    if (isset($arg['helper'])) {
                        $helperName = explode('/', (string)$arg['helper']);
                        $helperMethod = array_pop($helperName);
                        $helperName = implode('/', $helperName);
                        $arg = $arg->asArray();
                        unset($arg['@']);
                        $args[$key] = call_user_func_array(array(Mage::helper($helperName), $helperMethod), $arg);
                    } else {
                        /**
                         * if there is no helper we hope that this is assoc array
                         */
                        $arr = array();
                        foreach($arg as $subkey => $value) {
                            $arr[(string)$subkey] = $value->asArray();
                        }
                        if (!empty($arr)) {
                            $args[$key] = $arr;
                        }
                    }
                }
            }

            if (isset($node['json'])) {
                $json = explode(' ', (string)$node['json']);
                foreach ($json as $arg) {
                    $args[$arg] = Mage::helper('core')->jsonDecode($args[$arg]);
                }
            }

            $this->_translateLayoutNode($node, $args);
            call_user_func_array(array($block, $method), $args);
        }

        Varien_Profiler::stop($_profilerKey);

        return $this;
    }

    /**
     * Translate layout node
     *
     * @param Varien_Simplexml_Element $node
     * @param array $args
     **/
    protected function _translateLayoutNode($node, &$args)
    {
        if (isset($node['translate'])) {
            // Translate value by core module if module attribute was not set
            $moduleName = (isset($node['module'])) ? (string)$node['module'] : 'core';

            // Handle translations in arrays if needed
            $translatableArguments = explode(' ', (string)$node['translate']);
            foreach ($translatableArguments as $translatableArgumentName) {
                /*
                 * .(dot) character is used as a path separator in nodes hierarchy
                 * e.g. info.title means that Magento needs to translate value of <title> node
                 * that is a child of <info> node
                 */
                // @var $argumentHierarhy array - path to translatable item in $args array
                $argumentHierarchy = explode('.', $translatableArgumentName);
                $argumentStack = &$args;
                $canTranslate = true;
                while (is_array($argumentStack) && count($argumentStack) > 0) {
                    $argumentName = array_shift($argumentHierarchy);
                    if (isset($argumentStack[$argumentName])) {
                        /*
                         * Move to the next element in arguments hieracrhy
                         * in order to find target translatable argument
                         */
                        $argumentStack = &$argumentStack[$argumentName];
                    } else {
                        // Target argument cannot be found
                        $canTranslate = false;
                        break;
                    }
                }
                if ($canTranslate && is_string($argumentStack)) {
                    // $argumentStack is now a reference to target translatable argument so it can be translated
                    $argumentStack = Mage::helper($moduleName)->__($argumentStack);
                }
            }
        }
    }

    /**
     *
     * @return Mage_Core_Model_Layout
     */
    public function deleteRemoveInstructions()
    {
        $xml = $this->getLayout()->getUpdate()->asSimplexml();
        $removeInstructions = $xml->xpath("//remove");
        if (is_array($removeInstructions)) {
            unset($xml->remove);
        }
        $this->getLayout()->setXml($xml);
        return $this;
    }
}
