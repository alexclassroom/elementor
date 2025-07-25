import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import EditorPage from '../pages/editor-page';
import WpAdminPage from '../pages/wp-admin-page';
import { wpCli } from '../assets/wp-cli';
import ImportTemplatesModal from '../pages/plugins/the-plus-addons/import-templates-modal';

const pluginList: { pluginName: string, installSource: 'api' | 'cli' | 'zip', hasInstallationPage?: boolean }[] = [
	{ pluginName: 'essential-addons-for-elementor-lite', installSource: 'api' },
	{ pluginName: 'jetsticky-for-elementor', installSource: 'api' },
	{ pluginName: 'jetgridbuilder', installSource: 'api' },
	{ pluginName: 'the-plus-addons-for-elementor-page-builder', installSource: 'api' },
	{ pluginName: 'stratum', installSource: 'api' },
	{ pluginName: 'bdthemes-prime-slider-lite', installSource: 'api' },
	{ pluginName: 'wunderwp', installSource: 'api' },
	{ pluginName: 'addon-elements-for-elementor-page-builder', installSource: 'api' },
	{ pluginName: 'anywhere-elementor', installSource: 'api' },
	{ pluginName: 'astra-sites', installSource: 'api', hasInstallationPage: true },
	{ pluginName: 'connect-polylang-elementor', installSource: 'api' },
	{ pluginName: 'dynamic-visibility-for-elementor', installSource: 'api' },
	{ pluginName: 'elementskit-lite', installSource: 'api' },
	{ pluginName: 'envato-elements', installSource: 'cli' },
	{ pluginName: 'exclusive-addons-for-elementor', installSource: 'api', hasInstallationPage: true },
	{ pluginName: 'header-footer-elementor', installSource: 'api' },
	{ pluginName: 'jeg-elementor-kit', installSource: 'cli' },
	{ pluginName: 'make-column-clickable-elementor', installSource: 'api' },
	{ pluginName: 'metform', installSource: 'cli' },
	{ pluginName: 'music-player-for-elementor', installSource: 'cli' },
	{ pluginName: 'ooohboi-steroids-for-elementor', installSource: 'api' },
	{ pluginName: 'post-grid-elementor-addon', installSource: 'api' },
	{ pluginName: 'powerpack-lite-for-elementor', installSource: 'api', hasInstallationPage: true },
	{ pluginName: 'premium-addons-for-elementor', installSource: 'cli' },
	{ pluginName: 'rife-elementor-extensions', installSource: 'api' },
	{ pluginName: 'royal-elementor-addons', installSource: 'cli' },
	{ pluginName: 'sb-elementor-contact-form-db', installSource: 'api' },
	{ pluginName: 'skyboot-custom-icons-for-elementor', installSource: 'api', hasInstallationPage: true },
	{ pluginName: 'sticky-header-effects-for-elementor', installSource: 'api' },
	{ pluginName: 'timeline-widget-addon-for-elementor', installSource: 'api' },
	{ pluginName: 'unlimited-elements-for-elementor', installSource: 'api' },
	{ pluginName: 'visibility-logic-elementor', installSource: 'api' },
	{ pluginName: 'ht-mega-for-elementor', installSource: 'api' },
	{ pluginName: 'tutor-lms-elementor-addons', installSource: 'api' },
	{ pluginName: 'code-block-for-elementor', installSource: 'api' },
	{ pluginName: 'jetwidgets-for-elementor', installSource: 'api' },
	{ pluginName: 'happy-elementor-addons', installSource: 'cli', hasInstallationPage: true },
	{ pluginName: 'enqueue-media-on-front', installSource: 'zip' },
	{ pluginName: 'akismet', installSource: 'api' },
	{ pluginName: 'wordpress-seo', installSource: 'api', hasInstallationPage: true },
	{ pluginName: 'hello-plus', installSource: 'cli' },
];

export const generatePluginTests = ( testType: string ) => {
	for ( const plugin of pluginList ) {
		test( `"${ plugin.pluginName }" plugin: @pluginTester1_${ testType }`, async ( { page, apiRequests }, testInfo ) => {
			let pluginTechnicalName: string;
			switch ( plugin.installSource ) {
				case 'api':
					pluginTechnicalName = await apiRequests.installPlugin( page.context().request, plugin.pluginName, true );
					break;
				case 'cli':
					await wpCli( `wp plugin install ${ plugin.pluginName } --activate` );
					break;
				case 'zip':
					await wpCli( `wp plugin install elementor-playwright/plugin-tester-plugins/${ plugin.pluginName }.zip --activate` );
					break;
			}

			try {
				const editor = new EditorPage( page, testInfo );
				const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
				const adminBar = 'wpadminbar';

				await page.goto( '/law-firm-about/' );
				await page.locator( `#${ adminBar }` ).waitFor();
				await page.evaluate( ( selector ) => {
					const admin = document.getElementById( selector );
					admin.remove();
				}, adminBar );
				await editor.removeClasses( 'elementor-motion-effects-element' );
				await page.locator( '[data-widget_type="progress.default"]' ).first().scrollIntoViewIfNeeded();
				await page.waitForTimeout( 500 );
				await expect.soft( page ).toHaveScreenshot( 'frontPage.png', { fullPage: true } );

				if ( plugin.hasInstallationPage ) {
					try {
						await page.goto( '/wp-admin/index.php' );
					} catch ( error ) {
						throw Error( `Error during navigation: ${ error.message }` );
					}
				}

				await page.goto( '/law-firm-about/?elementor' );
				await wpAdmin.closeAnnouncementsIfVisible();

				if ( 'the-plus-addons-for-elementor-page-builder' === plugin.pluginName ) {
					const plusAddonTemplateModal = new ImportTemplatesModal( page );
					await plusAddonTemplateModal.skipTemplatesImportIfVisible();
				}

				await editor.closeNavigatorIfOpen();

				await expect.soft( page ).toHaveScreenshot( 'editor.png', { fullPage: true } );
			} finally {
				if ( 'api' === plugin.installSource ) {
					await apiRequests.deactivatePlugin( page.context().request, pluginTechnicalName );
					await apiRequests.deletePlugin( page.context().request, pluginTechnicalName );
				} else {
					await wpCli( `wp plugin uninstall ${ plugin.pluginName } --deactivate` );
				}
			}
		} );
	}
};
