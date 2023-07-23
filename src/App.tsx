import React, { useState, useEffect, FormEvent, useRef } from 'react';
import './App.css';
import '@aws-amplify/ui-react/styles.css';
import { API } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from './graphql/mutations';

interface Note {
  id?: string;
  name: string;
  description: string;
}

const App: React.FC<{ signOut?: any }> = ({ signOut }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const data: any = (apiData as any).data; // Typecast to 'any' to access data
    const notesFromAPI: Note[] = data.listNotes.items;
    setNotes(notesFromAPI);
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return; // Safeguard to handle null reference
    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const data: Note = {
      name,
      description,
    };
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    // Reset the form manually using the reference
    formRef.current.reset();
  }

  async function deleteNote({ id }: Note) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View
        as="form"
        margin="3rem 0"
        onSubmit={(e) => createNote(e)}
        ref={formRef}
      >
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);

// import React, { useState, useEffect } from 'react';
// import './App.css';
// import '@aws-amplify/ui-react/styles.css';
// import { API } from 'aws-amplify';
// import {
//   Button,
//   Flex,
//   Heading,
//   Text,
//   TextField,
//   View,
//   withAuthenticator,
// } from '@aws-amplify/ui-react';
// import { listNotes } from './graphql/queries';
// import {
//   createNote as createNoteMutation,
//   deleteNote as deleteNoteMutation,
// } from './graphql/mutations';

// const App = ({ signOut }: { signOut?: any }) => {
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     fetchNotes();
//   }, []);

//   async function fetchNotes() {
//     const apiData = await API.graphql({ query: listNotes });
//     const notesFromAPI = apiData.data.listNotes.items;
//     setNotes(notesFromAPI);
//   }

//   async function createNote(event) {
//     event.preventDefault();
//     const form = new FormData(event.target);
//     const data = {
//       name: form.get('name'),
//       description: form.get('description'),
//     };
//     await API.graphql({
//       query: createNoteMutation,
//       variables: { input: data },
//     });
//     fetchNotes();
//     event.target.reset();
//   }

//   async function deleteNote({ id }) {
//     const newNotes = notes.filter((note) => note.id !== id);
//     setNotes(newNotes);
//     await API.graphql({
//       query: deleteNoteMutation,
//       variables: { input: { id } },
//     });
//   }

//   return (
//     <View className="App">
//       <Heading level={1}>My Notes App</Heading>
//       <View as="form" margin="3rem 0" onSubmit={createNote}>
//         <Flex direction="row" justifyContent="center">
//           <TextField
//             name="name"
//             placeholder="Note Name"
//             label="Note Name"
//             labelHidden
//             variation="quiet"
//             required
//           />
//           <TextField
//             name="description"
//             placeholder="Note Description"
//             label="Note Description"
//             labelHidden
//             variation="quiet"
//             required
//           />
//           <Button type="submit" variation="primary">
//             Create Note
//           </Button>
//         </Flex>
//       </View>
//       <Heading level={2}>Current Notes</Heading>
//       <View margin="3rem 0">
//         {notes.map((note) => (
//           <Flex
//             key={note.id || note.name}
//             direction="row"
//             justifyContent="center"
//             alignItems="center"
//           >
//             <Text as="strong" fontWeight={700}>
//               {note.name}
//             </Text>
//             <Text as="span">{note.description}</Text>
//             <Button variation="link" onClick={() => deleteNote(note)}>
//               Delete note
//             </Button>
//           </Flex>
//         ))}
//       </View>
//       <Button onClick={signOut}>Sign Out</Button>
//     </View>
//   );
// };

// export default withAuthenticator(App);
