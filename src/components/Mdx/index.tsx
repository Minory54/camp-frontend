type MdxComponentProps = {
  section: "theory" | "components";
  id: number;
};

export const MdxComponent = ({ section, id }: MdxComponentProps) => {
  if (section === "theory") {
    return (
      <p>
        {section} под номером {id}
      </p>
    );
  }

  return (
    <p>
      {section} под номером {id}
    </p>
  );
};
