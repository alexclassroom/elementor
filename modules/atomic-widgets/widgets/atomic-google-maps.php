<?php

namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Google_Maps extends Atomic_Widget_Base {
	public function get_atomic_controls(): array {
		return [
			Textarea_Control::bind_to(
				'api_key'
			)->set_label( __( 'API Key', 'elementor' ) ),
			Textarea_Control::bind_to(
				'address'
			)->set_label( __( 'Address', 'elementor' ) ),
			Textarea_Control::bind_to(
				'zoom'
			)->set_label( __( 'Zoom', 'elementor' ) ),
		];
	}

	public function get_name() {
		return 'a-google-maps';
	}
	protected function render() {
		$url = 'https://maps.google.com/maps/?q=%1$s&amp;t=m&amp;z=%2$d&amp;output=embed&amp;iwloc=near';
		$params = [
			$this->get_settings( 'address' ) ?? esc_html__( 'London Eye, London, United Kingdom', 'elementor' ),
			$this->get_settings( 'zoom' ) ?? 10,
			$this->get_settings( 'api_key' ) ?? false,
		];

		if ( $params[2] ) {
			$url = 'https://www.google.com/maps/embed/v1/place?key=%3$s&q=%1$s&amp;zoom=%2$d';
		}
		?>
		<iframe loading="lazy"
				src="<?php echo esc_url( vsprintf( $url, $params ) ); ?>"
				title="<?php echo esc_attr( $params[0] ); ?>"
				aria-label="<?php echo esc_attr( $params[0] ); ?>"
		></iframe>
		<?php
	}

	public function get_title() {
		return esc_html__( 'Atomic Google Maps', 'elementor' );
	}


	public function get_icon() {
		return 'eicon-google-maps';
	}
}