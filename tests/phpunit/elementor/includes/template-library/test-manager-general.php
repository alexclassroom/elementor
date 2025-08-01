<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Core\Base\Document;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\TemplateLibrary\Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\TemplateLibrary\Source_Local;

class Elementor_Test_Manager_General extends Elementor_Test_Base {
	/**
	 * @var Manager
	 */
	protected static $manager;

	protected $sourceCloudMock;

	private $fake_post_id = '123';

	public static function setUpBeforeClass(): void {
		self::$manager = self::elementor()->templates_manager;
	}

	public function setUp(): void
	{
		parent::setUp();
		$this->mock_cloud_library();

		$this->mock_manager_cloud_source($this->sourceCloudMock);
	}

	private function mock_manager_cloud_source($sourceCloudMock)
	{
		$reflection = new \ReflectionClass(self::$manager);
		$sourcesProperty = $reflection->getProperty('_registered_sources');
		$sourcesProperty->setAccessible(true);

		$sources = $sourcesProperty->getValue(self::$manager);

		$sources['cloud'] = $sourceCloudMock;

		$sourcesProperty->setValue(self::$manager, $sources);
	}

	protected function mock_cloud_library() {
		$cloud_library_app_mock = $this->getMockBuilder( '\Elementor\Modules\CloudLibrary\Connect\Cloud_Library' )
			->onlyMethods( [ 'get_resources' ] )
			->disableOriginalConstructor()
			->getMock();

		$cloud_library_app_mock
			->method( 'get_resources' )
			->willReturn( [] );

		$sourceCloudMock = $this->getMockBuilder( 'Elementor\TemplateLibrary\Source_Cloud' )
			->onlyMethods( [ 'get_app', 'get_items', 'get_id', 'bulk_delete_items' ] )
			->disableOriginalConstructor()
			->getMock();

		$sourceCloudMock->method( 'get_app' )->willReturn( $cloud_library_app_mock );
		$sourceCloudMock->method( 'get_id' )->willReturn( 'cloud' );

		$this->sourceCloudMock = $sourceCloudMock;
	}

	public function test_should_return_import_images_instance() {
		$this->assertEquals( self::$manager->get_import_images_instance(), new \Elementor\TemplateLibrary\Classes\Import_Images() );
	}

	public function test_should_return_wp_error_source_class_name_not_exists_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'invalid class' ), 'source_class_name_not_exists' );
	}


	public function test_should_return_wp_error_wrong_instance_source_from_register_source() {
		$this->assertWPError( self::$manager->register_source( 'Elementor\Core\Common\Modules\Ajax\Module' ), 'wrong_instance_source' );
	}

	public function test_should_fail_to_return_source() {
		$this->assertFalse( self::$manager->get_source( 'invalid source' ) );
	}

	public function test_should_return_wp_error_arguments_not_specified_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template( [ 'post_id' => $this->fake_post_id ] ), 'arguments_not_specified'
		);
	}

	public function test_should_return_wp_error_template_error_from_save_template() {
		$this->assertWPError(
			self::$manager->save_template(
				[
					'post_id' => $this->fake_post_id,
					'source' => 'invalid source',
					'content' => 'content',
					'type' => 'page',
				]
			),
			'template_error'
		);
	}

	public function test_should_return_wp_error_arguments_not_specified_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template( [ 'post_id' => $this->fake_post_id ] ), 'arguments_not_specified'
		);
	}


	public function test_should_return_wp_error_template_error_from_update_template() {
		$this->assertWPError(
			self::$manager->update_template(
				[
					'source' => 'invalid source',
					'content' => 'content',
					'type' => 'page',
				]
			),
			'template_error'
		);
	}

	public function test_should_return_wp_error_update_templates() {
		$templates = [
			'templates' => [
				[
					'source' => 'invalid content 1 ',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->fake_post_id,
				],
				[
					'source' => 'invalid content 2',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->fake_post_id,
				],
			],
		];

		$this->assertWPError( self::$manager->update_templates( $templates ) );
	}

	public function test_should_return_true_from_update_templates() {
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		$templates = [
			'templates' => [
				[
					'source' => 'local',
					'content' => 'content',
					'type' => 'page',
					'id' => $this->factory()->create_and_get_default_post()->ID,
				],
				[
					'source' => 'local',
					'content' => 'content',
					'type' => 'comment',
					'id' => $this->factory()->create_and_get_default_post()->ID,
				],
			],
		];

		$this->assertTrue( self::$manager->update_templates( $templates ) );
	}


	public function test_should_return_wp_error_massage_arguments_not_specified_from_get_template_data() {
		$this->assertWPError( self::$manager->get_template_data( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_massage_template_error_from_get_template_data() {
		$elementor_mock = $this->getMockBuilder( Elementor_Adapter_Interface::class )->getMock();
		$elementor_mock->method( 'get_template_type' )->willReturn( 'page' );
		self::$manager->set_elementor_adapter( $elementor_mock );

		$this->assertWPError(
			self::$manager->get_template_data(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
					'edit_mode' => true,
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_arguments_not_specified_from_delete_template() {
		$this->assertWPError( self::$manager->delete_template( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_template_error_from_delete_template() {
		$this->assertWPError(
			self::$manager->delete_template(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_arguments_not_specified_from_export_template() {
		$this->assertWPError( self::$manager->export_template( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_template_error_from_export_template() {
		$this->assertWPError(
			self::$manager->export_template(
				[
					'source' => 'invalid source',
					'template_id' => $this->fake_post_id,
				]
			), 'template_error'
		);
	}

	public function test_get_templates() {
		// Arrange
		$admin = $this->act_as_admin();

		$document_ids = $this->create_mock_templates( $admin, 'container_flexbox' );

		$this->sourceCloudMock->method( 'get_items' )->willReturn( [] );

		// Act
		$templates = self::$manager->get_templates();

		// Assert
		$ids = array_map( function ( $item ) {
			return $item['template_id'];
		}, $templates );

		$this->assertCount( 3, $templates );
		$this->assertEqualSets( $document_ids, $ids );
	}

	public function test_get_templates__only_local() {
		// Arrange
		$admin = $this->act_as_admin();

		$document_ids = $this->create_mock_templates( $admin );

		// Act
		$templates = self::$manager->get_templates( [ 'local' ] );

		// Assert
		$ids = array_map( function ( $item ) {
			return $item['template_id'];
		}, $templates );

		$this->assertCount( 1, $templates );
		$this->assertEqualSets( [ $document_ids[0] ], $ids );
	}

	public function test_get_templates__only_remote_from_transient() {
		// Arrange
		$admin = $this->act_as_admin();

		$document_ids = $this->create_mock_templates( $admin, 'container_flexbox' );

		// Act
		$templates = self::$manager->get_templates( [ 'remote' ] );

		// Assert
		$ids = array_map( function ( $item ) {
			return $item['template_id'];
		}, $templates );

		$this->assertCount( 2, $templates );
		$this->assertEqualSets( [ $document_ids[1], $document_ids[2] ], $ids );
	}

	public function test_get_templates__only_remote_from_remote() {
		// Arrange
		$admin = $this->act_as_admin();

		$this->create_remote_mock_templates();

		// Act
		$templates = self::$manager->get_templates( [ 'remote' ] );

		// Assert
		$this->assertCount( 2, $templates );
	}

	public function test_get_templates__only_remote_with_force_update() {
		// Arrange
		$admin = $this->act_as_admin();

		$this->create_remote_mock_templates();

		// Act
		$templates = self::$manager->get_templates( [ 'remote' ], true );

		// Assert
		$this->assertCount( 2, $templates );
	}

	public function test_get_templates__only_cloud() {
		// Arrange
		$admin = $this->act_as_admin();

		$this->create_cloud_mock_templates();

		// Act
		$templates = self::$manager->get_templates( [ 'cloud' ] );

		// Assert
		$this->assertCount( 2, $templates );
	}

	private function create_mock_templates( $user, $layout_type = '' ) {
		$templates = [
			[
				'id' => 100,
				'title' => 'A',
				'thumbnail' => 'https://localhost/test.png',
				'author' => 'Elementor',
				'url' => 'https://localhost/url',
				'type' => 'popup',
				'subtype' => 'classic',
				'tags' => '[]',
				'menu_order' => 0,
				'popularity_index' => 100,
				'trend_index' => 100,
				'has_page_settings' => 1,
				'is_pro' => 1,
				'access_level' => 1,
				'tmpl_created' => '2020-10-10',
			],
			[
				'id' => 200,
				'title' => 'B',
				'thumbnail' => 'https://localhost/test.png',
				'author' => 'Elementor',
				'url' => 'https://localhost/url',
				'type' => 'popup',
				'subtype' => 'classic',
				'tags' => '[]',
				'menu_order' => 0,
				'popularity_index' => 100,
				'trend_index' => 100,
				'has_page_settings' => 1,
				'is_pro' => 1,
				'access_level' => 1,
				'tmpl_created' => '2020-10-10',
			]
		];

		add_filter( 'pre_http_request', function () use ( $templates ) {
			return [
				'headers' => [],
				'response' => [
					'code' => 200,
					'message' => 'OK',
				],
				'cookies' => [],
				'filename' => '',
				'body' => wp_json_encode( $templates ),
			];
		}, 10, 3 );

		$document = $this->factory()->documents->create_and_get([
			'type' => 'page',
			'post_author' => $user->ID,
			'post_status' => 'publish',
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::TYPE_META_KEY => 'page'
			]
		]);

		return [ $document->get_id(), 100, 200 ];
	}

	private function create_remote_mock_templates( $layout_type = '' ) {
		$templates = [
			[
				'id' => 100,
				'title' => 'A',
				'thumbnail' => 'https://localhost/test.png',
				'author' => 'Elementor',
				'url' => 'https://localhost/url',
				'type' => 'popup',
				'subtype' => 'classic',
				'tags' => '[]',
				'menu_order' => 0,
				'popularity_index' => 100,
				'trend_index' => 100,
				'has_page_settings' => 1,
				'is_pro' => 1,
				'access_level' => 1,
				'tmpl_created' => '2020-10-10',
			],
			[
				'id' => 200,
				'title' => 'B',
				'thumbnail' => 'https://localhost/test.png',
				'author' => 'Elementor',
				'url' => 'https://localhost/url',
				'type' => 'popup',
				'subtype' => 'classic',
				'tags' => '[]',
				'menu_order' => 0,
				'popularity_index' => 100,
				'trend_index' => 100,
				'has_page_settings' => 1,
				'is_pro' => 1,
				'access_level' => 1,
				'tmpl_created' => '2020-10-10',
			]
		];

		add_filter( 'pre_http_request', function () use ( $templates ) {
			return [
				'headers' => [],
				'response' => [
					'code' => 200,
					'message' => 'OK',
				],
				'cookies' => [],
				'filename' => '',
				'body' => wp_json_encode( $templates ),
			];
		}, 10, 3 );
	}

	private function create_cloud_mock_templates() {
		$templates = [
			[
				"id" => 1,
				"createdAt" => "2025-01-21T10:45:32.541Z",
				"updatedAt" => "2025-01-21T10:45:32.541Z",
				"parentId" => null,
				"authorId" => "123",
				"authorEmail" => "mock@email.com",
				"title" => "AFolder",
				"type" => "FOLDER",
				"templateType" => "",
			],
			[
				"id" => 2,
				"createdAt" => "2025-01-21T10:45:32.541Z",
				"updatedAt" => "2025-01-21T10:45:32.541Z",
				"parentId" => null,
				"authorId" => "123",
				"authorEmail" => "mock@email.com",
				"title" => "ATemplate",
				"type" => "TEMPLATE",
				"templateType" => "",
			],
		];

		$response = [
			"total" => 2,
			"data" => $templates,
		];

		$this->sourceCloudMock->method( 'get_items' )->willReturn( $response );
		$this->sourceCloudMock->method( 'get_id' )->willReturn( 'cloud' );
	}

	public function test_should_return_wp_error_arguments_not_specified_from_bulk_delete_templates() {
		$this->assertWPError( self::$manager->bulk_delete_templates( [] ), 'arguments_not_specified' );
	}

	public function test_should_return_wp_error_template_error_from_bulk_delete_templates() {
		$this->assertWPError(
			self::$manager->bulk_delete_templates(
				[
					'source' => 'invalid source',
					'template_ids' => [ 1, 2, 3 ],
				]
			), 'template_error'
		);
	}

	public function test_should_return_true_from_bulk_delete_templates() {
		// Arrange
		$template_ids = [ 1, 2, 3 ];

		$this->sourceCloudMock
			->method( 'bulk_delete_items' )
			->with( $template_ids )
			->willReturn( true );

		// Act
		$result = self::$manager->bulk_delete_templates( [
			'source' => 'cloud',
			'template_ids' => $template_ids,
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_return_wp_error_when_template_ids_is_empty() {
		$this->assertWPError(
			self::$manager->bulk_delete_templates(
				[
					'source' => 'cloud',
					'template_ids' => [],
				]
			), 'arguments_not_specified'
		);
	}

	public function test_should_return_wp_error_when_source_is_incorrect() {
		$this->assertWPError(
			self::$manager->bulk_delete_templates(
				[
					'source' => 'test',
					'template_ids' => [ 1 ],
				]
			), 'template_error'
		);
	}

	public function test_should_return_wp_error_when_template_ids_is_not_array() {
		$this->assertWPError(
			self::$manager->bulk_delete_templates(
				[
					'source' => 'cloud',
					'template_ids' => 'not_an_array',
				]
			), 'arguments_not_specified'
		);
	}
}
