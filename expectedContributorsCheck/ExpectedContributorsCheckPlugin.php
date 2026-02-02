<?php

namespace APP\plugins\generic\expectedContributorsCheck;

use PKP\plugins\GenericPlugin;
use PKP\core\PKPApplication;
use PKP\template\TemplateManager;
use HookRegistry;
use APP\core\Application;

class ExpectedContributorsCheckPlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = null)
    {
        if (parent::register($category, $path, $mainContextId)) {
            HookRegistry::register('TemplateManager::display', function ($hookName, $args) {
                $request = Application::get()->getRequest();
                $templateMgr = $args[0];
                $template = $args[1];

                $router = $request->getRouter();
                $dispatcher = $router->getDispatcher();
                $page = $request->getRequestedPage();
                $op = $request->getRequestedOp();
                $args = $request->getRequestedArgs();

                // Get stageId from URL args if available
                $stageId = $request->getUserVar('stageId');
                error_log('[ExpectedContributorsCheck] Hook fired - page: ' . $page . ', op: ' . $op . ', stageId: ' . var_export($stageId, true));


                if ($page === 'submission' && $op === 'index') {
                    error_log('[ExpectedContributorsCheck] Injecting JS globally');
                    $templateMgr->addJavaScript(
                        'expectedContributorsCheck',
                        $request->getBaseUrl() . '/plugins/generic/expectedContributorsCheck/js/expectedContributorsCheckv16.js',
                        ['contexts' => 'backend']
                    );
                }

                return false;
            });

            return true;
        }

        return false;
    }


    public function getDisplayName()
    {
        return __('plugins.generic.expectedContributorsCheck.name');
    }

    public function getDescription()
    {
        return __('plugins.generic.expectedContributorsCheck.description');
    }

    public function injectJs($hookName, $args)
    {
        /** @var TemplateManager $templateMgr */
        $templateMgr = $args[0];
        $template = $args[1];

        // Get the current request object safely
        $request = \Application::get()->getRequest();
        $router = $request->getRouter();

        $page = $router->getRequestedPage($request);
        $op = $router->getRequestedOp($request);

        $stageId = $request->getUserVar('stageId');

        // Contributor step is stage 3
        if ($page === 'submission' && $op === 'wizard' && $stageId == 3) {
            $jsUrl = $this->getPluginPath() . '/expectedContributorsCheck.js';
            $templateMgr->addJavaScript('expectedContributorsCheck', $jsUrl);
            error_log('[ExpectedContributorsCheck] JS injected on contributor step: ' . $jsUrl);
        } else {
            error_log("[ExpectedContributorsCheck] Skipped - page: $page, op: $op, stageId: $stageId");
        }

        return false;
    }

}
