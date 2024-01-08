import { Person } from './sendEmail';

const getTemplate = ({
  name,
  email,
  heading,
  content,
}: Person & { heading: string; content: string }) => {
  return `
        <!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Transaction Notification</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f6f6f6;
			color: #444444;
			line-height: 1.6em;
			padding: 20px;
			margin: 0;
		}

		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
			padding: 20px;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
			border-radius: 5px;
		}

		h1 {
			font-size: 24px;
			margin-top: 0;
			text-align: center;
		}

		p {
			margin-bottom: 20px;
		}

		.button {
			display: inline-block;
			background-color: #4CAF50;
			color: #ffffff;
			text-align: center;
			padding: 10px 20px;
			text-decoration: none;
			border-radius: 5px;
		}

		.button:hover {
			background-color: #3e8e41;
		}

		.footer {
			font-size: 12px;
			color: #999999;
			text-align: center;
			margin-top: 50px;
			padding-top: 20px;
			border-top: 1px solid #cccccc;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>${heading}</h1>
		<p>Hello <strong>${name.toUpperCase()}</strong>,</p>
		${content}
		</div>
		<div class="footer">
			<p>This email was sent to ${email.toLowerCase()} because you made a transaction with us.</p>
		</div>
	</div>
</body>
</html>`;
};

// <h1>Account Created Successfully!</h1>
// 	<p>Hello <strong>${name.toUpperCase()}</strong>,</p>
// 	<p>Thank you for choosing Taskify. Go legend in a month with our AI Task Tracking service.</p>
// 	<p>If you have any questions or concerns, please don't hesitate to contact us.</p>
// 	<a href="https://ubedshaikh.netlify.app/home" class="button">Visit developer's website</a>
// 	</div>

export default getTemplate;