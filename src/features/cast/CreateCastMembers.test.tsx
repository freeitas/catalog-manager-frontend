import { rest } from "msw";
import { setupServer } from "msw/node";

import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from "../../utils/test-utils";
import { CreateCastMember } from "./CreateCastMembers";
import { baseUrl } from "../api/apiSlice";

export const handlers = [
  rest.post(`${baseUrl}/cast_members`, (_, res, ctx) => {
    return res(ctx.delay(150), ctx.status(201));
  }),
];

const server = setupServer(...handlers);

describe("CreateCastMember", () => {
  afterAll(() => server.close());
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());

  it("should render correctly", () => {
    const { asFragment } = renderWithProviders(<CreateCastMember />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("should handle submit", async () => {
    renderWithProviders(<CreateCastMember />);
    const name = screen.getByTestId("name");
    const submit = screen.getByText("Save");

    fireEvent.change(name, { target: { value: "Test" } });
    fireEvent.click(submit);

    await waitFor(() => {
      const text = screen.getByText("Cast member created");
      expect(text).toBeInTheDocument();
    });
  });

  it("should handle submit error", async () => {
    server.use(
      rest.post(`${baseUrl}/cast_members`, (_, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderWithProviders(<CreateCastMember />);
    const name = screen.getByTestId("name");
    const submit = screen.getByText("Save");

    fireEvent.change(name, { target: { value: "Test" } });
    fireEvent.click(submit);

    await waitFor(() => {
      const text = screen.getByText("Cast member not created");
      expect(text).toBeInTheDocument();
    });
  });
});
 52 changes: 52 additions & 0 deletions52  
src/features/cast/CreateCastMembers.tsx
@@ -0,0 +1,52 @@
import { useEffect, useState } from "react";
import { CastMember } from "../../types/CastMembers";
import { initialState, useCreateCastMemberMutation } from "./castMembersSlice";
import { useSnackbar } from "notistack";
import { Box } from "@mui/system";
import { Paper, Typography } from "@mui/material";
import { CastMemberForm } from "./components/CastMembersform";

export const CreateCastMember = () => {
  const [castMemberState, setCastMemberState] =
    useState<CastMember>(initialState);
  const [createCastMember, status] = useCreateCastMemberMutation();
  const { enqueueSnackbar } = useSnackbar();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCastMemberState({ ...castMemberState, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createCastMember(castMemberState);
  }

  useEffect(() => {
    if (status.isSuccess) {
      enqueueSnackbar(`Cast member created`, { variant: "success" });
    }
    if (status.isError) {
      enqueueSnackbar(`Cast member not created`, { variant: "error" });
    }
  }, [status, enqueueSnackbar]);

  return (
    <Box>
      <Paper>
        <Box p={2}>
          <Box mb={2}>
            <Typography variant="h4">Create Cast Member</Typography>
          </Box>
        </Box>
        <CastMemberForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          castMember={castMemberState}
          isLoading={status.isLoading}
          isdisabled={status.isLoading}
        />
      </Paper>
    </Box>
  );
};