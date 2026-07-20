export type BoardTask = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: string;
  key: string;
  name: string;
  position: number;
  tasks: BoardTask[];
};

export type Board = {
  id: string;
  name: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
    ownerId: string;
  };
  columns: BoardColumn[];
};
