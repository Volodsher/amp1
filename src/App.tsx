import React, { useState, useEffect, FormEvent, useRef } from 'react';
import './App.css';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Image,
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
  image: string;
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
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return; // Safeguard to handle null reference
    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const data: Note = {
      name,
      description,
      image,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await API.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    // Reset the form manually using the reference
    formRef.current.reset();
  }

  async function deleteNote({ id, name }: Note) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
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
            {note.image && (
              <Image
                src={note.image}
                alt={`visual aid for ${note.name}`}
                style={{ width: 400 }}
              />
            )}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <View name="image" as="input" type="file" style={{ alignSelf: 'end' }} />
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
