import { SvgIcon } from '@elementor/ui';

const EvolveIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M2.30691 2.71291C2.27024 2.80134 2.25 2.89831 2.25 3V8C2.25 8.41421 2.58579 8.75 3 8.75C3.41421 8.75 3.75 8.41421 3.75 8V4.81066L10.0056 11.0663L10.0057 11.0663C10.8022 11.8631 11.2497 12.9434 11.25 14.07V14.0702V15V21C11.25 21.4142 11.5858 21.75 12 21.75C12.4142 21.75 12.75 21.4142 12.75 21V15V14.0702V14.07C12.7503 12.9434 13.1979 11.863 13.9944 11.0663L20.25 4.81066V8C20.25 8.41421 20.5858 8.75 21 8.75C21.4142 8.75 21.75 8.41421 21.75 8V3C21.75 2.98706 21.7497 2.97419 21.749 2.96141C21.7446 2.87376 21.7251 2.79009 21.6931 2.71291C21.6565 2.62445 21.6022 2.54158 21.5303 2.46967C21.4584 2.39776 21.3755 2.34351 21.2871 2.30691C21.1987 2.27024 21.1017 2.25 21 2.25H16C15.5858 2.25 15.25 2.58579 15.25 3C15.25 3.41421 15.5858 3.75 16 3.75H19.1893L12.9337 10.0057L12.9336 10.0057C12.5656 10.3739 12.2526 10.7867 12 11.2316C11.7474 10.7867 11.4344 10.3739 11.0664 10.0057L11.0663 10.0057L4.81066 3.75H8C8.41421 3.75 8.75 3.41421 8.75 3C8.75 2.58579 8.41421 2.25 8 2.25H3C2.7937 2.25 2.60686 2.33329 2.47126 2.46808C2.47073 2.46861 2.4702 2.46914 2.46967 2.46967C2.46914 2.4702 2.46861 2.47073 2.46808 2.47126C2.39696 2.5428 2.34324 2.62511 2.30691 2.71291Z" />
		</SvgIcon>
	);
} );

export default EvolveIcon;