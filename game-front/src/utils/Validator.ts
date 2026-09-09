
const url = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

class Validator {
	static url (website: string = '') {
		return !!website.match(url);
	}
}

export default Validator;
