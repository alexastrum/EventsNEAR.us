
document.addEventListener("DOMContentLoaded", event => {

	const app = firebase.app();

	const db = firebase.firestore();

	const myUser = db.collection('users').doc('SKRZOUBCQnU4artuhSND')

	myUser.get()
		.then(doc => {

			const data = doc.data();
			console.log(data.name)

		})

})


function googleSignin() {
	const provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth().signInWithPopup(provider)
		.then(result => {

			const user = result.user;
			document.write(`Hello ${user.displayName}`);
		}

	)
}